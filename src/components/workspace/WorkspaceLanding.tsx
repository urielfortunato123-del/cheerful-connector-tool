import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WorkspaceService } from '@/services/WorkspaceService';
import { FolderOpen, Plus, RotateCcw, Layout, Briefcase, Database, HardDrive, Cpu, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export function WorkspaceLanding() {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error('Informe um nome para o projeto');
      return;
    }
    
    // Check for directory handle BEFORE setting loading state
    // This ensures we call showDirectoryPicker as a direct result of the click if needed
    if (!WorkspaceService.hasDirectoryHandle()) {
      const selected = await WorkspaceService.selectWorkspace();
      if (!selected) return; // User cancelled or error already toasted
    }

    setIsLoading(true);
    try {
      const project = await WorkspaceService.createProject(projectName);
      if (project) {
        toast.success('Workspace criado com sucesso');
        // The event infraflow_project_changed is already dispatched in createProject
        // which will trigger the UI update in __root.tsx
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWorkspace = async () => {
    try {
      // Call selectWorkspace FIRST to preserve user gesture context
      const selected = await WorkspaceService.selectWorkspace();
      if (selected) {
        setIsLoading(true);
        // If selectWorkspace found a project, it's already in localStorage
        const active = WorkspaceService.getCurrentProject();
        if (active) {
          // The event infraflow_project_changed is already dispatched in selectWorkspace
          console.log('Workspace selected and active project found');
        } else {
          // If no metadata.json was found in root, we allow the user to name a new project in that folder
          setIsCreating(true);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao abrir workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await WorkspaceService.restoreBackup(file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2" />
      
      <div className="max-w-4xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-48 w-full max-w-md flex items-center justify-center group hover:scale-105 transition-all duration-700">
              <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src="/logo.png?v=2" 
                alt="Logo" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,107,0,0.3)]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase">Infra<span className="text-primary">Flow</span></h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium tracking-tight">
              Sistema Operacional de Engenharia Rodoviária Profissional
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <Card className="glass-card hover:border-primary/50 hover:bg-white/[0.03] transition-all group cursor-pointer border-white/5 py-4" onClick={() => setIsCreating(true)}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Novo Projeto</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/60 mt-1">Iniciar um novo workspace técnico</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card hover:border-primary/50 hover:bg-white/[0.03] transition-all group cursor-pointer border-white/5 py-4" onClick={handleOpenWorkspace}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Abrir Projeto</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/60 mt-1">Carregar dados de um diretório local</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card hover:border-primary/50 hover:bg-white/[0.03] transition-all group cursor-pointer border-white/5 py-4 relative overflow-hidden" onClick={() => {}}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
                <RotateCcw className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Restaurar Backup</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/60 mt-1">Sincronizar via arquivo .zip</CardDescription>
              </div>
            </CardHeader>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleRestoreBackup}
              accept=".zip"
            />
          </Card>
        </div>

        {isCreating && (
          <div className="pt-4 space-y-6 max-w-md mx-auto animate-in zoom-in-95 fade-in duration-500">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-1">Identificador do Workspace</label>
              <Input 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Duplicação_BR_153_Lote_04"
                className="h-14 text-lg bg-white/5 border-white/10 focus:border-primary/50 transition-all font-bold placeholder:text-muted-foreground/30 placeholder:font-medium rounded-xl"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-14 glass-card border-white/10 font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all" onClick={() => setIsCreating(false)} disabled={isLoading}>Cancelar</Button>
              <Button className="flex-1 h-14 font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:shadow-[0_0_40px_rgba(255,107,0,0.4)] transition-all" onClick={handleCreateProject} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isLoading ? 'Inicializando...' : 'Criar Workspace'}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-white/5">
          {[
            { icon: Database, label: "Local DB Sinc" },
            { icon: HardDrive, label: "File System API" },
            { icon: Briefcase, label: "Workspace Logic" },
            { icon: Cpu, label: "Geo-IA Context" }
          ].map((item, idx) => (
            <div key={idx} className="space-y-3 group cursor-default">
              <item.icon className="h-6 w-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors duration-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors duration-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

