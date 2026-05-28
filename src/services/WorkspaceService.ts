import { db } from '../lib/db';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { get, set } from 'idb-keyval';

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
    if (typeof window === 'undefined') return false;
    
    if (!('showDirectoryPicker' in window)) {
      toast.error('Seu navegador não suporta a File System Access API. Use Chrome ou Edge.');
      return false;
    }

    try {
      console.log('Opening directory picker...');
      // @ts-ignore
      this.directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      
      console.log('Directory selected:', this.directoryHandle.name);
      // Persist the directory handle for later retrieval
      await set('infraflow_directory_handle', this.directoryHandle);
      
      // Try to read existing project if metadata exists in the ROOT of selected folder
      try {
        const metaFile = await this.directoryHandle.getFileHandle('metadata.json');
        const file = await metaFile.getFile();
        const content = await file.text();
        const metadata = JSON.parse(content);
        console.log('Project metadata found in folder root:', metadata.name);
        this.currentProject = metadata;
        localStorage.setItem('infraflow_active_project', JSON.stringify(metadata));
        
        await this.loadProjectData();
        window.dispatchEvent(new CustomEvent('infraflow_project_changed', { detail: metadata }));
        
        toast.success('Workspace carregado com sucesso');
        return true;
      } catch (e) {
        console.log('No metadata.json found in root, ready for new project or manual subfolder navigation');
        return true;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('User cancelled directory selection');
      } else {
        console.error('Erro ao selecionar workspace:', error);
        toast.error('Erro ao acessar a pasta selecionada');
      }
      return false;
    }
  }

  static async restoreHandle() {
    try {
      const handle = await get('infraflow_directory_handle');
      if (handle) {
        // @ts-ignore - check if we still have permission
        const permission = await handle.queryPermission({ mode: 'readwrite' });
        if (permission === 'granted') {
          this.directoryHandle = handle as FileSystemDirectoryHandle;
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao restaurar handle do diretório:', error);
    }
    return false;
  }

  static async createProject(name: string) {
    if (!this.directoryHandle) {
      const selected = await this.selectWorkspace();
      if (!selected) return null;
    }

    try {
      const projectDir = await this.directoryHandle!.getDirectoryHandle(name, { create: true });
      
      // Create subdirectories
      const dirs = ['database', 'pdfs', 'orcamentos', 'mapas', 'medicoes', 'backups', 'logs', 'cache_ia'];
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
      window.dispatchEvent(new CustomEvent('infraflow_project_changed', { detail: metadata }));
      
      return metadata;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar estrutura do projeto');
      return null;
    }
  }

  static async loadProjectData(customDir?: FileSystemDirectoryHandle) {
    const projectDir = customDir || this.directoryHandle;
    if (!projectDir || !this.currentProject) return;

    try {
      const dbDir = await projectDir.getDirectoryHandle('database');
      const tables = ['documents', 'projects', 'budgets', 'measurements', 'memorials', 'asbuilt', 'dailyLogs', 'financial', 'mapFeatures'];
      
      for (const tableName of tables) {
        try {
          const fileHandle = await dbDir.getFileHandle(`${tableName}.json`);
          const file = await fileHandle.getFile();
          const content = await file.text();
          const data = JSON.parse(content);
          
          // @ts-ignore
          await db[tableName].clear();
          if (data && data.length > 0) {
            // @ts-ignore
            await db[tableName].bulkAdd(data);
          }
        } catch (e) {
          // Table file might not exist yet for new projects
        }
      }
    } catch (error) {
      console.warn('Estrutura de banco de dados não encontrada ou erro ao carregar:', error);
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

  static async restoreBackup(file: File) {
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      
      const metaFile = content.file("metadata.json");
      if (!metaFile) throw new Error("Arquivo de backup inválido (metadata.json ausente)");
      
      const metadata: ProjectMetadata = JSON.parse(await metaFile.async("string"));
      
      const tables = ['documents', 'projects', 'budgets', 'measurements', 'memorials', 'asbuilt', 'dailyLogs', 'financial', 'mapFeatures'];
      
      for (const tableName of tables) {
        const tableFile = content.file(`database/${tableName}.json`);
        if (tableFile) {
          const data = JSON.parse(await tableFile.async("string"));
          // @ts-ignore
          await db[tableName].clear();
          // @ts-ignore
          await db[tableName].bulkAdd(data);
        }
      }

      this.currentProject = metadata;
      localStorage.setItem('infraflow_active_project', JSON.stringify(metadata));
      
      toast.success('Backup restaurado com sucesso!');
      window.location.reload();
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup');
      return false;
    }
  }

  static async updateAIContext(context: string) {
    if (!this.currentProject) return;
    this.currentProject.aiContext = context;
    await this.saveProject();
  }

  static async resetData(options: { 
    measurements?: boolean; 
    contracts?: boolean; 
    budgets?: boolean; 
    geometries?: boolean;
    financial?: boolean;
    dailyLogs?: boolean;
    ai?: boolean;
  }) {
    try {
      if (options.measurements) await db.measurements.clear();
      if (options.budgets) await db.budgets.clear();
      if (options.geometries) await db.mapFeatures.clear();
      if (options.financial) await db.financial.clear();
      if (options.dailyLogs) await db.dailyLogs.clear();
      
      if (options.ai && this.currentProject) {
        this.currentProject.aiContext = undefined;
        await this.saveProject();
      }
      
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
      if (typeof window === 'undefined') return null;
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

  static async setupAutoSave() {
    setInterval(async () => {
      if (this.currentProject) {
        await this.saveProject();
        console.log('Autosave executado');
      }
    }, 30000); // 30 seconds
  }
}

// Initialize autosave
if (typeof window !== 'undefined') {
  WorkspaceService.setupAutoSave();
  WorkspaceService.restoreHandle();
}
