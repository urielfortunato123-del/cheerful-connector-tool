import * as XLSX from 'xlsx';
import { db } from './db';
import { toast } from 'sonner';

export const processExcelFile = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Salvar metadados no DB local usando o novo esquema
        const docId = await db.documents.add({
          nome: file.name,
          tipo: 'xlsx',
          categoria: 'Planilhas',
          orgao: 'Interno',
          hierarquia: ['Interno', 'Planilhas'],
          tamanho: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          dataUpload: Date.now(),
          tags: ['Excel', 'Planilha'],
          caminhoVirtual: `/downloads/${file.name}`,
          fileBlob: file,
          indexed: true,
          favorito: false
        });

        resolve({ docId, data: jsonData });
        toast.success(`Planilha ${file.name} processada e salva localmente.`);
      } catch (error) {
        console.error('Erro ao processar Excel:', error);
        reject(error);
        toast.error('Erro ao processar planilha.');
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const processPDFFile = async (file: File) => {
  // O processamento real do PDF será feito pelo DocumentProcessor
  const docId = await db.documents.add({
    nome: file.name,
    tipo: 'pdf',
    categoria: 'Biblioteca Técnica',
    orgao: 'DER-SP', // Default
    hierarquia: ['DER-SP', 'Biblioteca Técnica'],
    tamanho: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    dataUpload: Date.now(),
    tags: ['PDF', 'Manual'],
    caminhoVirtual: `/documents/${file.name}`,
    fileBlob: file,
    indexed: false, // Será indexado após extração de texto
    favorito: false
  });
  
  toast.success(`PDF ${file.name} salvo. Extraindo texto...`);
  return docId;
};

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
