import { db } from './db';
import { toast } from 'sonner';

// Lazy-load pdfjs-dist only in the browser (it references DOMMatrix etc.)
let pdfjsLibPromise: Promise<typeof import('pdfjs-dist')> | null = null;
const getPdfjs = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser');
  }
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
      return lib;
    });
  }
  return pdfjsLibPromise;
};

export const extractTextFromPDF = async (blob: Blob): Promise<string> => {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await blob.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const indexDocument = async (docId: number) => {
  const doc = await db.documents.get(docId);
  if (!doc || !doc.fileBlob) return;

  try {
    let text = '';
    let tags = [...doc.tags];

    if (doc.tipo === 'pdf') {
      text = await extractTextFromPDF(doc.fileBlob);
      // Basic automatic tagging based on keywords in text
      const keywords = ['drenagem', 'pavimentação', 'terraplenagem', 'estrutura', 'sinalização', 'geotecnia', 'meio ambiente'];
      keywords.forEach(kw => {
        if (text.toLowerCase().includes(kw) && !tags.includes(kw.toUpperCase())) {
          tags.push(kw.toUpperCase());
        }
      });
    } else if (['xlsx', 'xls', 'csv'].includes(doc.tipo)) {
      text = `Documento Planilha: ${doc.nome}. Categoria: ${doc.categoria}. Órgão: ${doc.orgao}. Conteúdo técnico para análise estruturada.`;
      if (!tags.includes('PLANILHA')) tags.push('PLANILHA');
    } else if (doc.tipo === 'docx' || doc.tipo === 'doc') {
      text = `Documento Word: ${doc.nome}. Base normativa ou memorial descritivo.`;
      if (!tags.includes('WORD')) tags.push('WORD');
    } else {
      text = `Arquivo ${doc.tipo.toUpperCase()}: ${doc.nome}.`;
    }

    await db.documents.update(docId, {
      textoExtraido: text,
      tags,
      indexed: true
    });
    
    toast.success(`Documento ${doc.nome} indexado com sucesso.`);
  } catch (error) {
    console.error('Indexing error:', error);
    toast.error(`Falha ao indexar ${doc.nome}. O arquivo pode estar corrompido.`);
  }
};

export const searchDocuments = async (query: string) => {
  if (!query) return await db.documents.toArray();
  
  const docs = await db.documents.toArray();
  const lowerQuery = query.toLowerCase();
  
  return docs.filter(doc => 
    doc.nome.toLowerCase().includes(lowerQuery) ||
    doc.categoria.toLowerCase().includes(lowerQuery) ||
    (doc.textoExtraido && doc.textoExtraido.toLowerCase().includes(lowerQuery)) ||
    doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
