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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie a persistência e segurança dos seus dados locais</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Banco de Dados Local (IndexedDB)</CardTitle>
            </div>
            <CardDescription>O InfraFlow opera 100% offline. Seus dados são armazenados de forma privada no seu navegador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Button className="flex-1 gap-2" variant="outline" onClick={exportDatabase}>
                <Download className="h-4 w-4" /> Exportar Backup (.json)
              </Button>
              <div className="flex-1 relative">
                <Button className="w-full gap-2" variant="outline">
                  <Upload className="h-4 w-4" /> Importar Backup
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
              <Trash2 className="h-4 w-4" /> Limpar Tudo e Resetar Sistema
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
