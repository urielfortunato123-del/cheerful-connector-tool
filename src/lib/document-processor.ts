import * as pdfjsLib from 'pdfjs-dist';
import { db } from './db';
import { toast } from 'sonner';

// Set up the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (blob: Blob): Promise<string> => {
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
    if (doc.tipo === 'pdf') {
      const text = await extractTextFromPDF(doc.fileBlob);
      await db.documents.update(docId, {
        textoExtraido: text,
        indexed: true
      });
      toast.success(`Documento ${doc.nome} indexado.`);
    } else {
      // For now only PDF indexing is semantic
      await db.documents.update(docId, { indexed: true });
    }
  } catch (error) {
    console.error('Indexing error:', error);
    toast.error(`Falha ao indexar ${doc.nome}`);
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
