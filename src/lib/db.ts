import Dexie, { type Table } from 'dexie';

export interface Project {
  id?: number;
  name: string;
  description: string;
  category: string;
  status: string;
  createdAt: number;
}

export interface Budget {
  id?: number;
  projectId?: number;
  contractObject: string;
  contractNumber: string;
  baseDate: string;
  extensionKm: number;
  items: any[];
  totalAmount: number;
  updatedAt: number;
}

export interface Document {
  id?: number;
  name: string;
  type: string;
  category: string;
  fileData: Blob;
  textContent?: string;
  metadata?: any;
  createdAt: number;
}

export interface LibraryChunk {
  id?: number;
  docId: number;
  content: string;
  metadata: any;
}

export interface ChatHistory {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: string;
}

export class InfraFlowDB extends Dexie {
  projects!: Table<Project>;
  budgets!: Table<Budget>;
  documents!: Table<Document>;
  libraryChunks!: Table<LibraryChunk>;
  chatHistory!: Table<ChatHistory>;

  constructor() {
    super('InfraFlowDB');
    this.version(1).stores({
      projects: '++id, name, category, status',
      budgets: '++id, projectId, contractNumber',
      documents: '++id, name, type, category',
      libraryChunks: '++id, docId',
      chatHistory: '++id, role, timestamp'
    });
  }
}

export const db = new InfraFlowDB();
