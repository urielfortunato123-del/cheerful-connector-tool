import { db } from '../lib/db';
import JSZip from 'jszip';
import { toast } from 'sonner';

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  aiContext?: string;
}

export class WorkspaceService {
  private static directoryHandle: FileSystemDirectoryHandle | null = null;
  private static currentProject: ProjectMetadata | null = null;

  static async selectWorkspace() {
    try {
      // @ts-ignore
      this.directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      toast.success('Workspace conectado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao selecionar workspace:', error);
      return false;
    }
  }

  static async createProject(name: string) {
    if (!this.directoryHandle) {
      const selected = await this.selectWorkspace();
      if (!selected) return null;
    }

    try {
      const projectDir = await this.directoryHandle!.getDirectoryHandle(name, { create: true });
      
      // Create subdirectories
      const dirs = ['database', 'pdf', 'geojson', 'imagens', 'orcamentos', 'memorial', 'diario', 'backup'];
      for (const dir of dirs) {
        await projectDir.getDirectoryHandle(dir, { create: true });
      }

      const metadata: ProjectMetadata = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        lastModified: Date.now()
      };

      // Save metadata
      const metaFile = await projectDir.getFileHandle('metadata.json', { create: true });
      const writable = await metaFile.createWritable();
      await writable.write(JSON.stringify(metadata));
      await writable.close();

      this.currentProject = metadata;
      localStorage.setItem('infraflow_active_project', JSON.stringify(metadata));
      
      return metadata;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar estrutura do projeto');
      return null;
    }
  }

  static async saveProject() {
    if (!this.directoryHandle || !this.currentProject) return;

    try {
      const projectDir = await this.directoryHandle.getDirectoryHandle(this.currentProject.name);
      const dbDir = await projectDir.getDirectoryHandle('database', { create: true });

      // Export all Dexie tables to JSON
      const tables = ['documents', 'projects', 'budgets', 'measurements', 'memorials', 'asbuilt', 'dailyLogs', 'financial', 'mapFeatures'];
      
      for (const tableName of tables) {
        // @ts-ignore
        const data = await db[tableName].toArray();
        const fileHandle = await dbDir.getFileHandle(`${tableName}.json`, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data));
        await writable.close();
      }

      this.currentProject.lastModified = Date.now();
      const metaFile = await projectDir.getFileHandle('metadata.json', { create: true });
      const writable = await metaFile.createWritable();
      await writable.write(JSON.stringify(this.currentProject));
      await writable.close();

      toast.success('Projeto salvo localmente');
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast.error('Erro ao salvar projeto');
    }
  }

  static async exportBackup() {
    if (!this.currentProject) return;

    const zip = new JSZip();
    const tables = ['documents', 'projects', 'budgets', 'measurements', 'memorials', 'asbuilt', 'dailyLogs', 'financial', 'mapFeatures'];
    
    const dbFolder = zip.folder("database");
    for (const tableName of tables) {
      // @ts-ignore
      const data = await db[tableName].toArray();
      dbFolder?.file(`${tableName}.json`, JSON.stringify(data));
    }

    zip.file("metadata.json", JSON.stringify(this.currentProject));

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentProject.name}_backup.zip`;
    a.click();
  }

  static async resetData(options: { 
    measurements?: boolean; 
    contracts?: boolean; 
    budgets?: boolean; 
    geometries?: boolean;
    financial?: boolean;
    dailyLogs?: boolean;
  }) {
    try {
      if (options.measurements) await db.measurements.clear();
      if (options.budgets) await db.budgets.clear();
      if (options.geometries) await db.mapFeatures.clear();
      if (options.financial) await db.financial.clear();
      if (options.dailyLogs) await db.dailyLogs.clear();
      // Projects is a bit different as it holds the project metadata in DB
      // We might want to clear it too if specifically asked
      
      toast.success('Dados zerados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao zerar dados:', error);
      toast.error('Erro ao zerar dados');
      return false;
    }
  }

  static getCurrentProject() {
    if (!this.currentProject) {
      const saved = localStorage.getItem('infraflow_active_project');
      if (saved) {
        this.currentProject = JSON.parse(saved);
      }
    }
    return this.currentProject;
  }

  static closeProject() {
    this.currentProject = null;
    localStorage.removeItem('infraflow_active_project');
    window.location.reload();
  }
}
