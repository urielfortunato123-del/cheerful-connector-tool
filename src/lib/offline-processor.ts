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

        // Salvar metadados no DB local
        const docId = await db.documents.add({
          name: file.name,
          type: 'xlsx',
          category: 'Planilhas',
          fileData: file,
          metadata: { rowCount: jsonData.length },
          createdAt: Date.now()
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
  // Simulação de extração de texto para POC
  // Em uma implementação real, usaríamos pdf.js para extrair chunks
  const docId = await db.documents.add({
    name: file.name,
    type: 'pdf',
    category: 'Biblioteca Técnica',
    fileData: file,
    textContent: "Conteúdo extraído do PDF...", // Placeholder
    createdAt: Date.now()
  });
  
  toast.success(`PDF ${file.name} indexado na biblioteca local.`);
  return docId;
};

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
