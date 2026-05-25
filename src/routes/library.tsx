import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Search, 
  Database, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  FileArchive,
  FileSpreadsheet,
  Clock,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";

export const Route = createFileRoute("/library")({
  component: Library,
});

type DocCategory = 
  | "Técnicas" 
  | "Projetos" 
  | "Manuais" 
  | "Conservação" 
  | "Pavimentação" 
  | "Drenagem" 
  | "Taludes" 
  | "Obras de Arte" 
  | "Geotecnia" 
  | "Sinalização";

interface DocumentRecord {
  id?: string;
  title: string;
  category: DocCategory;
  type: string;
  size: string;
  url: string;
  downloadedAt: number;
  indexed: boolean;
}

function Library() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalSize: "0 MB",
    indexedCount: 0,
    iaStatus: "Pronta"
  });

  useEffect(() => {
    loadLocalDocs();
  }, []);

  const loadLocalDocs = async () => {
    try {
      // In a real app, we'd query Dexie here
      // For this prototype, we'll simulate loading from DB
      const count = await (db as any).documents?.count() || 0;
      setStats(prev => ({ ...prev, totalCount: count }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setProgress(0);
    toast.info("Iniciando coleta de documentos DER-SP...");

    // Simulando navegação e download em lote
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress((i / steps) * 100);
      
      if (i === 1) toast.info("Acessando portal DER...");
      if (i === 2) toast.info("Identificando novos manuais e normas...");
      if (i === 3) toast.info("Baixando arquivos em lote (PDF/XLSX)...");
      if (i === 4) toast.info("Organizando em categorias técnicas...");
    }

    const newDocs: DocumentRecord[] = [
      { 
        title: "Manual de Drenagem Rodoviária", 
        category: "Drenagem", 
        type: "PDF", 
        size: "12.4 MB", 
        url: "#", 
        downloadedAt: Date.now(),
        indexed: true 
      },
      { 
        title: "Tabela de Preços Unitários - DER", 
        category: "Técnicas", 
        type: "XLSX", 
        size: "4.2 MB", 
        url: "#", 
        downloadedAt: Date.now(),
        indexed: true 
      },
      { 
        title: "Norma de Pavimentação Asfáltica", 
        category: "Pavimentação", 
        type: "PDF", 
        size: "2.8 MB", 
        url: "#", 
        downloadedAt: Date.now(),
        indexed: true 
      }
    ];

    setDocuments(prev => [...newDocs, ...prev]);
    setStats({
      totalCount: documents.length + newDocs.length,
      totalSize: "19.4 MB",
      indexedCount: documents.length + newDocs.length,
      iaStatus: "Atualizada"
    });

    setIsSyncing(false);
    setProgress(100);
    toast.success("Sincronização concluída com sucesso!");
  };

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF": return <FileText className="h-4 w-4 text-red-500" />;
      case "XLS":
      case "XLSX": return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case "ZIP": return <FileArchive className="h-4 w-4 text-amber-500" />;
      default: return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            DER Document Collector
          </h1>
          <p className="text-sm text-muted-foreground">Coleta e indexação automática de base técnica DER-SP</p>
        </div>
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sincronizar DER
        </Button>
      </div>

      {isSyncing && (
        <Card className="border-primary/20 bg-primary/5 animate-pulse">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-primary flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sincronizando base técnica...
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Documentos</p>
                <p className="text-xl font-bold">{stats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Database className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Volume Total</p>
                <p className="text-xl font-bold">{stats.totalSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Search className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Indexação</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{stats.indexedCount}</p>
                  <Badge variant="outline" className="text-[8px] h-4 bg-green-500/5 text-green-600 border-green-500/20">OK</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">IA Documental</p>
                <p className="text-xl font-bold text-primary">{stats.iaStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">Biblioteca Técnica</CardTitle>
                <CardDescription>Arquivos oficiais organizados por categoria</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar documentos..." 
                  className="pl-9 h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Nenhum documento sincronizado</p>
                      <p className="text-xs text-muted-foreground">Clique em "Sincronizar DER" para alimentar sua base técnica local.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc, i) => (
                      <div key={i} className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            {getFileIcon(doc.type)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{doc.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-[9px] h-4 py-0">{doc.category}</Badge>
                              <span className="text-[10px] text-muted-foreground">{doc.size} • {doc.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.indexed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                "Técnicas", "Projetos", "Manuais", "Conservação", 
                "Pavimentação", "Drenagem", "Taludes", "Obras de Arte", 
                "Geotecnia", "Sinalização"
              ].map(cat => (
                <button key={cat} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-xs transition-colors group">
                  <span className="text-muted-foreground group-hover:text-foreground">{cat}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Últimas Atualizações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-medium">Manual de Pavimentação</p>
                  <span className="text-[9px] text-muted-foreground">Hoje, 10:45</span>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-medium">TPU Setembro/2021</p>
                  <span className="text-[9px] text-muted-foreground">Ontem</span>
                </div>
              </div>
              <div className="pt-2 border-t border-primary/10">
                <p className="text-[9px] text-muted-foreground italic">
                  A IA utiliza automaticamente estes documentos para fundamentar orçamentos e análises técnicas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
