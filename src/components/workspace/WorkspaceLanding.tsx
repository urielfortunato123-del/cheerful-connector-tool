import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WorkspaceService } from '@/services/WorkspaceService';
import { FolderOpen, Plus, RotateCcw, Layout, Briefcase, Database, HardDrive, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export function WorkspaceLanding() {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error('Informe um nome para o projeto');
      return;
    }
    const project = await WorkspaceService.createProject(projectName);
    if (project) {
      window.location.reload();
    }
  };

  const handleOpenWorkspace = async () => {
    const selected = await WorkspaceService.selectWorkspace();
    if (selected) {
      // In a real app, we'd list projects in that workspace
      // For now, we'll just show the creation dialog or allow picking one
      setIsCreating(true);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await WorkspaceService.restoreBackup(file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-primary/40 group hover:scale-110 transition-transform duration-500 p-2 overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dcii6r5op/image/upload/v1779890945/promaxx/hg1u4zvxghgnzleyp5hd.png" 
                alt="Logo" 
                className="w-full h-full object-contain group-hover:rotate-6 transition-transform"
              />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl">
            Infra<span className="text-primary italic">Flow</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Sistema Operacional de Engenharia Rodoviária Profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Card className="glass-card hover:border-primary/50 transition-all group cursor-pointer" onClick={() => setIsCreating(true)}>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Novo Projeto</CardTitle>
              <CardDescription>Criar um novo workspace completo</CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover:border-primary/50 transition-all group cursor-pointer" onClick={handleOpenWorkspace}>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Abrir Projeto</CardTitle>
              <CardDescription>Carregar projeto de uma pasta local</CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Restaurar Backup</CardTitle>
              <CardDescription>Importar arquivo .zip de backup</CardDescription>
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
          <div className="pt-8 space-y-4 max-w-md mx-auto animate-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Nome do Workspace</label>
              <Input 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Duplicação_BR_153_Lote_04"
                className="h-12 text-lg bg-black/40 border-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button className="flex-1 h-12 font-bold" onClick={handleCreateProject}>Criar Workspace</Button>
            </div>
          </div>
        )}

        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <Database className="h-5 w-5 mx-auto text-primary/60" />
            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Local DB Sinc</p>
          </div>
          <div className="space-y-1">
            <HardDrive className="h-5 w-5 mx-auto text-primary/60" />
            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">File System API</p>
          </div>
          <div className="space-y-1">
            <Briefcase className="h-5 w-5 mx-auto text-primary/60" />
            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Workspace Logic</p>
          </div>
          <div className="space-y-1">
            <Cpu className="h-5 w-5 mx-auto text-primary/60" />
            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Geo-IA Context</p>
          </div>
        </div>
      </div>
    </div>
  );
}
