import Dexie, { type Table } from 'dexie';

export interface Document {
  id?: number;
  nome: string;
  tipo: string;
  categoria: string;
  orgao: string;
  tamanho: string;
  dataUpload: number;
  textoExtraido?: string;
  tags: string[];
  caminhoVirtual: string;
  fileBlob?: Blob;
  indexed: boolean;
}

export interface Project {
  id?: number;
  nome: string;
  rodovia: string;
  kmInicial: number;
  kmFinal: number;
  lado: 'N' | 'S' | 'L' | 'O' | 'Crescente' | 'Decrescente';
  status: 'Em Planejamento' | 'Em Execução' | 'Concluído' | 'Paralisado';
  dataCriacao: number;
}

export interface Budget {
  id?: number;
  projectId: number;
  itens: any[];
  valorTotal: number;
  dataBase: string;
  observacoes?: string;
}

export interface Measurement {
  id?: number;
  projectId: number;
  tipoServico: string;
  quantidade: number;
  unidade: string;
  valor: number;
  data: number;
  fotos?: string[]; // base64 strings
}

export interface Memorial {
  id?: number;
  projectId: number;
  conteudo: string;
  pdfGerado?: Blob;
  dataCriacao: number;
}

export interface AsBuilt {
  id?: number;
  projectId: number;
  arquivos: { nome: string; blob: Blob; tipo: string }[];
  observacoes?: string;
  dataUpload: number;
}

export interface DailyLog {
  id?: number;
  projectId: number;
  data: number;
  clima: string;
  equipe: string;
  observacoes: string;
  fotos?: string[];
}

export interface Financial {
  id?: number;
  projectId: number;
  tipo: 'Entrada' | 'Saída';
  valor: number;
  descricao: string;
  data: number;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  contextDocs?: number[]; // IDs of documents used for context
}

export class InfraFlowDB extends Dexie {
  documents!: Table<Document>;
  projects!: Table<Project>;
  budgets!: Table<Budget>;
  measurements!: Table<Measurement>;
  memorials!: Table<Memorial>;
  asbuilt!: Table<AsBuilt>;
  dailyLogs!: Table<DailyLog>;
  financial!: Table<Financial>;
  chatHistory!: Table<ChatMessage>;

  constructor() {
    super('InfraFlowDB_V3');
    this.version(1).stores({
      documents: '++id, nome, tipo, categoria, orgao, indexed',
      projects: '++id, nome, rodovia, status',
      budgets: '++id, projectId',
      measurements: '++id, projectId',
      memorials: '++id, projectId',
      asbuilt: '++id, projectId',
      dailyLogs: '++id, projectId, data',
      financial: '++id, projectId, tipo',
      chatHistory: '++id, timestamp'
    });
  }
}

export const db = new InfraFlowDB();
