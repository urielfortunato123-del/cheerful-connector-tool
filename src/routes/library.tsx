import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ChevronRight,
  Upload,
  Trash2,
  Eye,
  FileIcon
} from "lucide-react";
import { toast } from "sonner";
import { db, Document } from "@/lib/db";
import { indexDocument, searchDocuments } from "@/lib/document-processor";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/library")({
  component: Library,
});

function Library() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalCount: 0,
    totalSize: "0 MB",
    indexedCount: 0,
    iaStatus: "Pronta"
  });
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadDocs();
    loadHistory();
  }, [searchTerm]);

  const loadHistory = async () => {
    const logs = await db.syncHistory.orderBy('timestamp').reverse().toArray();
    setHistory(logs);
  };

  const loadDocs = async () => {
    try {
      const results = searchTerm 
        ? await searchDocuments(searchTerm)
        : await db.documents.toArray();
      
      setDocuments(results as Document[]);
      
      const indexedCount = results.filter(d => d.indexed).length;
      const totalBytes = results.reduce((acc, d) => {
        const sizeStr = d.tamanho.split(' ')[0];
        return acc + (parseFloat(sizeStr) || 0) * 1024 * 1024;
      }, 0);

      setStats({
        totalCount: results.length,
        totalSize: `${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
        indexedCount,
        iaStatus: indexedCount === results.length && results.length > 0 ? "Atualizada" : "Processando"
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async (agency: string) => {
    setIsSyncing(true);
    setSyncStatus(`Conectando ao portal ${agency}...`);
    setProgress(10);
    
    const startTime = Date.now();
    let downloaded = 0;
    let totalSizeBytes = 0;
    const errors: string[] = [];

    try {
      // Mocking scraping and downloading
      await new Promise(r => setTimeout(r, 1500));
      setSyncStatus(`Buscando novos documentos em ${agency}...`);
      setProgress(30);

      // Simulating finding 1-3 new documents
      const newDocsCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < newDocsCount; i++) {
        setProgress(30 + ((i + 1) / newDocsCount) * 40);
        const fileName = `${agency}_NORMA_${Math.floor(Math.random() * 1000)}.pdf`;
        
        // Check duplication
        const exists = await db.documents.where('nome').equals(fileName).first();
        if (exists) {
          errors.push(`Documento ${fileName} já existe na base local.`);
          continue;
        }

        const size = (Math.random() * 5 + 1).toFixed(2);
        totalSizeBytes += parseFloat(size) * 1024 * 1024;

        const docId = await db.documents.add({
          nome: fileName,
          tipo: 'pdf',
          categoria: 'Normas',
          orgao: agency,
          tamanho: `${size} MB`,
          dataUpload: Date.now(),
          tags: [agency, 'Sincronizado', 'Norma'],
          caminhoVirtual: `/sync/${agency}/${fileName}`,
          indexed: false
        });

        // Automatic reindexing
        setSyncStatus(`Indexando ${fileName}...`);
        await indexDocument(docId);
        downloaded++;
      }

      await db.syncHistory.add({
        agency,
        timestamp: Date.now(),
        status: 'Sucesso',
        filesDownloaded: downloaded,
        totalSize: `${(totalSizeBytes / 1024 / 1024).toFixed(2)} MB`,
        errors: errors.length > 0 ? errors : undefined
      });

      toast.success(`Sincronização ${agency} concluída! ${downloaded} novos arquivos.`);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Erro desconhecido");
      await db.syncHistory.add({
        agency,
        timestamp: Date.now(),
        status: 'Erro',
        filesDownloaded: downloaded,
        totalSize: "0 MB",
        errors
      });
      toast.error(`Falha na sincronização ${agency}`);
    } finally {
      setIsSyncing(false);
      setSyncStatus("");
      setProgress(0);
      loadDocs();
      loadHistory();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSyncing(true);
    let completed = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(((i) / files.length) * 100);
      
      try {
        const docId = await db.documents.add({
          nome: file.name,
          tipo: file.name.split('.').pop()?.toLowerCase() || 'bin',
          categoria: 'Uploads',
          orgao: 'Manual',
          tamanho: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          dataUpload: Date.now(),
          tags: ['Manual', 'Importado'],
          caminhoVirtual: `/user/${file.name}`,
          fileBlob: file,
          indexed: false
        });

        await indexDocument(docId);
        completed++;
      } catch (err) {
        toast.error(`Erro ao subir ${file.name}`);
      }
    }

    setProgress(100);
    setTimeout(() => {
      setIsSyncing(false);
      setProgress(0);
      loadDocs();
      toast.success(`${completed} documentos importados e indexados.`);
    }, 500);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Excluir este documento da base local?")) {
      await db.documents.delete(id);
      loadDocs();
      toast.info("Documento removido.");
    }
  };

  const handlePreview = (doc: Document) => {
    if (doc.fileBlob) {
      const url = URL.createObjectURL(doc.fileBlob);
      setPreviewUrl(url);
      setSelectedDoc(doc);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF": return <FileText className="h-4 w-4 text-red-500" />;
      case "XLS":
      case "XLSX": return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case "ZIP": return <FileArchive className="h-4 w-4 text-amber-500" />;
      default: return <FileIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Biblioteca Inteligente
          </h1>
          <p className="text-sm text-muted-foreground">Repositório técnico oficial DER-SP / DNIT (Offline)</p>
        </div>
        <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => handleSync('DER-SP')}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar DER
            </Button>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => handleSync('DNIT')}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar DNIT
            </Button>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => handleSync('ABNT')}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar ABNT
            </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-xs gap-2" onClick={() => setShowHistory(true)}>
          <Clock className="h-3 w-3" /> Ver Histórico de Sincronização
        </Button>
      </div>

      {isSyncing && (
        <Card className="border-primary/20 bg-primary/5 animate-pulse">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-primary flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {syncStatus}
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
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Volume Local</p>
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
                  <Badge variant="outline" className="text-[8px] h-4 bg-green-500/5 text-green-600 border-green-500/20">Sincronizado</Badge>
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
                <p className="text-[10px] uppercase font-bold text-muted-foreground">IA Técnica</p>
                <p className="text-xl font-bold text-primary">{stats.iaStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">Biblioteca Técnica Local</CardTitle>
                <CardDescription>Busca textual em PDFs e planilhas armazenadas no navegador</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Pesquisar conteúdo..." 
                  className="pl-9 h-9 w-full md:w-64 bg-background"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Nenhum documento encontrado</p>
                      <p className="text-xs text-muted-foreground">Importe normas ou manuais para iniciar sua base offline.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-3" onClick={() => handlePreview(doc)}>
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center cursor-pointer">
                            {getFileIcon(doc.tipo)}
                          </div>
                          <div className="cursor-pointer">
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{doc.nome}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-[9px] h-4 py-0">{doc.categoria}</Badge>
                              <span className="text-[10px] text-muted-foreground">{doc.tamanho} • {doc.tipo.toUpperCase()} • {format(doc.dataUpload, 'dd/MM/yy')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.indexed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleDelete(doc.id!)}>
                            <Trash2 className="h-4 w-4" />
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
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Filtros Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                "DER-SP", "DNIT", "ABNT", "Tabelas TPU", 
                "Manuais", "Projetos", "As-Built", "Drenagem", 
                "Pavimentação", "Sinalização"
              ].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSearchTerm(cat)}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-xs transition-colors group"
                >
                  <span className={`${searchTerm === cat ? "text-primary font-bold" : "text-muted-foreground"} group-hover:text-foreground`}>{cat}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Status da Base Local
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <span className="text-muted-foreground">Capacidade IA:</span>
                  <span className="font-bold text-green-500">Alta</span>
                </div>
                <div className="flex justify-between items-start text-xs">
                  <span className="text-muted-foreground">Documentos Indexados:</span>
                  <span className="font-bold">{stats.indexedCount}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-primary/10">
                <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                  O sistema InfraFlow processa todos os documentos localmente. Seus dados nunca saem do seu dispositivo sem permissão.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden glass-card">
          <DialogHeader className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedDoc && getFileIcon(selectedDoc.tipo)}
                {selectedDoc?.nome}
              </DialogTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => selectedDoc?.fileBlob && window.open(URL.createObjectURL(selectedDoc.fileBlob))}>
                <Download className="h-4 w-4" /> Baixar
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-muted/20">
            {previewUrl && selectedDoc?.tipo === 'pdf' ? (
              <iframe 
                src={`${previewUrl}#toolbar=0`} 
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            ) : previewUrl && (selectedDoc?.tipo === 'jpg' || selectedDoc?.tipo === 'png') ? (
              <div className="flex items-center justify-center h-full p-8">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-xl" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <AlertCircle className="h-12 w-12 opacity-20" />
                <p className="text-sm">Pré-visualização não disponível para este formato.</p>
                <Button variant="outline" onClick={() => selectedDoc?.fileBlob && window.open(URL.createObjectURL(selectedDoc.fileBlob))}>
                  Baixar para visualizar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
