import Dexie, { type Table } from 'dexie';

export interface Document {
  id?: number;
  nome: string;
  tipo: string;
  categoria: string; // e.g., 'Técnicas', 'ET', 'Drenagem'
  subcategoria?: string;
  orgao: string; // 'DER-SP', 'DNIT', 'ABNT', 'Manual'
  hierarquia: string[]; // ['DER-SP', 'Técnicas', 'Drenagem']
  tamanho: string;
  dataUpload: number;
  textoExtraido?: string;
  tags: string[];
  caminhoVirtual: string;
  fileBlob?: Blob;
  indexed: boolean;
  favorito: boolean;
  metadados?: {
    autor?: string;
    dataDocumento?: string;
    resumoIA?: string;
    versao?: string;
  };
}

export interface Project {
  id?: number;
  nome: string;
  rodovia: string;
  contrato?: string;
  cliente?: string;
  tipoObra?: string;
  kmInicial: number;
  kmFinal: number;
  lado: 'N' | 'S' | 'L' | 'O' | 'Crescente' | 'Decrescente';
  status: 'Em Planejamento' | 'Em Execução' | 'Concluído' | 'Paralisado';
  dataCriacao: number;
  geometriaVinculada?: any; // Armazena GeoJSON ou ID de feição
  favorito?: boolean;
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
  coordinates?: [number, number][]; // Coordenadas para o mapa
  fotos?: string[]; // base64 strings
}

export interface MapFeature {
  id?: number;
  type: 'point' | 'line' | 'area';
  category: 'obras' | 'drenagem' | 'pavimentacao' | 'contratos' | 'financeiro' | 'acidentes' | 'sinalizacao' | 'normas' | 'medicoes' | 'projetos' | 'hidrografia' | 'curvas_nivel' | 'geral';
  name: string;
  coordinates: any; 
  properties: {
    distance?: number;
    area?: number;
    volume?: number;
    width?: number;
    description?: string;
    color?: string;
    thickness?: number;
    standard?: string; 
    riskLevel?: 'Low' | 'Medium' | 'High';
    budgetEstimate?: number;
    projectId?: number;
    linkedModuleId?: number;
    linkedModuleType?: string;
    aiInsights?: string;
    [key: string]: any; // Permite propriedades dinâmicas de engenharia
  };
  createdAt: number;
  updatedAt: number;
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
  contextChunks?: { docName: string; category: string; text: string; docId?: number }[];
}

export interface SyncLog {
  id?: number;
  agency: string;
  timestamp: number;
  status: 'Sucesso' | 'Erro' | 'Em andamento';
  filesDownloaded: number;
  totalSize: string;
  errors?: string[];
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
  syncHistory!: Table<SyncLog>;
  mapFeatures!: Table<MapFeature>;

  constructor() {
    super('InfraFlowDB_V5');
    this.version(1).stores({
      documents: '++id, nome, tipo, categoria, subcategoria, orgao, indexed, favorito, *hierarquia, *tags',
      projects: '++id, nome, rodovia, status',
      budgets: '++id, projectId',
      measurements: '++id, projectId',
      memorials: '++id, projectId',
      asbuilt: '++id, projectId',
      dailyLogs: '++id, projectId, data',
      financial: '++id, projectId, tipo',
      chatHistory: '++id, timestamp',
      syncHistory: '++id, timestamp, agency',
      mapFeatures: '++id, type, category, name, createdAt, updatedAt'
    });
  }
}

export const db = new InfraFlowDB();
