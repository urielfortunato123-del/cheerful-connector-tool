import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Smartphone, 
  Monitor,
  CloudOff
} from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { WorkspaceService } from "@/services/WorkspaceService";
import { 
  RotateCcw,
  Ruler,
  FileText,
  Calculator,
  Bot,
  Map as MapIcon,
  HardHat,
  History,
  BarChart3
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const exportDatabase = async () => {
    try {
      // Collect all tables data
      const tables = ['documents', 'projects', 'budgets', 'measurements', 'memorials', 'asbuilt', 'dailyLogs', 'financial', 'chatHistory'];
      const backup: any = {};
      
      for (const table of tables) {
        backup[table] = await (db as any)[table].toArray();
      }

      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InfraFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast.success("Backup exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar backup.");
    }
  };

  const importDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (confirm("Isso irá sobrescrever os dados locais. Continuar?")) {
        const tables = Object.keys(backup);
        for (const table of tables) {
          if ((db as any)[table]) {
            await (db as any)[table].clear();
            await (db as any)[table].bulkAdd(backup[table]);
          }
        }
        toast.success("Backup restaurado com sucesso!");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      toast.error("Erro ao importar arquivo de backup.");
    }
  };

  const clearCache = async () => {
    if (confirm("Deseja realmente limpar todos os dados locais e cache?")) {
      await db.delete();
      const cachesKeys = await caches.keys();
      for (const key of cachesKeys) {
        await caches.delete(key);
      }
      toast.success("Sistema resetado. Reiniciando...");
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleSelectiveReset = async (options: any) => {
    if (confirm("Deseja realmente zerar os módulos selecionados? Esta ação não pode ser desfeita.")) {
      await WorkspaceService.resetData(options);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Configurações Operacionais
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie a arquitetura de workspace e persistência de engenharia</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              <CardTitle>Gestão de Workspace (Projeto Ativo)</CardTitle>
            </div>
            <CardDescription>O InfraFlow opera com sistema de diretório local para máxima segurança.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-xl bg-black/40 border border-primary/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Workspace Atual</p>
                  <p className="text-lg font-bold">{WorkspaceService.getCurrentProject()?.name || "Nenhum"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => WorkspaceService.saveProject()}>
                    <Download className="h-4 w-4 mr-2" /> Salvar Agora
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => WorkspaceService.exportBackup()}>
                    <History className="h-4 w-4 mr-2" /> Backup ZIP
                  </Button>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <CardTitle>Reset Seletivo de Módulos</CardTitle>
            </div>
            <CardDescription>Zere dados operacionais sem remover documentos da biblioteca técnica.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/20 hover:bg-destructive/10"
                onClick={() => handleSelectiveReset({ measurements: true })}
              >
                <Ruler className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <p className="text-xs font-bold">Medições</p>
                  <p className="text-[10px] text-muted-foreground">Zerar histórico</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/20 hover:bg-destructive/10"
                onClick={() => handleSelectiveReset({ budgets: true })}
              >
                <Calculator className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <p className="text-xs font-bold">Orçamentos</p>
                  <p className="text-[10px] text-muted-foreground">Zerar itens</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/20 hover:bg-destructive/10"
                onClick={() => handleSelectiveReset({ geometries: true })}
              >
                <MapIcon className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <p className="text-xs font-bold">Geometrias</p>
                  <p className="text-[10px] text-muted-foreground">Limpar mapa</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/20 hover:bg-destructive/10"
                onClick={() => handleSelectiveReset({ dailyLogs: true })}
              >
                <FileText className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <p className="text-xs font-bold">Diário de Obra</p>
                  <p className="text-[10px] text-muted-foreground">Zerar registros</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/20 hover:bg-destructive/10"
                onClick={() => handleSelectiveReset({ financial: true })}
              >
                <BarChart3 className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <p className="text-xs font-bold">Financeiro</p>
                  <p className="text-[10px] text-muted-foreground">Limpar fluxo</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/20 hover:bg-destructive/10"
                onClick={() => handleSelectiveReset({ ai: true })}
              >
                <Bot className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <p className="text-xs font-bold">IA Contextual</p>
                  <p className="text-[10px] text-muted-foreground">Zerar aprendizado</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Manutenção de Banco de Dados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Button className="flex-1 gap-2" variant="outline" onClick={exportDatabase}>
                <Download className="h-4 w-4" /> Exportar JSON Manual
              </Button>
              <div className="flex-1 relative">
                <Button className="w-full gap-2" variant="outline">
                  <Upload className="h-4 w-4" /> Importar JSON Manual
                </Button>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={importDatabase}
                  accept=".json"
                />
              </div>
            </div>
            <Button className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" variant="outline" onClick={clearCache}>
              <Trash2 className="h-4 w-4" /> Deletar Banco Local e Cache (Hard Reset)
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle>Instalação PWA</CardTitle>
            </div>
            <CardDescription>Acesse o InfraFlow como um aplicativo nativo no Windows, macOS, Android ou iOS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 flex items-center gap-3">
                <Monitor className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-xs font-bold uppercase">Desktop</p>
                  <p className="text-[10px] text-muted-foreground">Clique no ícone de instalar na barra do navegador.</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-xs font-bold uppercase">Mobile</p>
                  <p className="text-[10px] text-muted-foreground">"Adicionar à tela de início" no menu do Safari/Chrome.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Privacidade & Segurança</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
               <CloudOff className="h-5 w-5 text-primary mt-1" />
               <p className="text-xs text-muted-foreground leading-relaxed">
                 O InfraFlow foi projetado com a arquitetura **Privacy-First**. Suas orçamentos, projetos e diários de obra nunca são enviados para a nuvem sem sua ação explícita de exportação. O processamento de IA utiliza APIs seguras, mas os documentos brutos permanecem na sua **Sandbox Local**.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center opacity-30 py-8">
        <p className="text-[10px] uppercase font-black tracking-widest">InfraFlow v3.0.0 Stable • Engine: Dexie 4.0</p>
      </div>
    </div>
  );
}
