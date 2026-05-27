import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Database, 
  Search, 
  Upload, 
  RefreshCw, 
  Grid2X2, 
  List, 
  Filter,
  ArrowUpDown,
  FileText,
  Clock,
  LayoutDashboard,
  BrainCircuit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { db, Document } from "@/lib/db";
import { indexDocument, searchDocuments } from "@/lib/document-processor";
import { LibraryExplorer } from "@/components/library/explorer/LibraryExplorer";
import { DocumentGrid } from "@/components/library/DocumentGrid";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { DocumentViewer } from "@/components/library/viewer/DocumentViewer";
import { AskAI } from "@/components/library/AskAI";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  component: Library,
});

function Library() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [currentHierarchy, setCurrentHierarchy] = useState<string[]>([]);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [selectedDocForAI, setSelectedDocForAI] = useState<Document | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pdf: 0,
    excel: 0,
    word: 0,
    indexed: 0
  });

  useEffect(() => {
    loadDocuments();
  }, [searchTerm, selectedCategoryId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      let results: Document[] = [];
      if (searchTerm) {
        results = await searchDocuments(searchTerm) as Document[];
      } else {
        results = await db.documents.toArray();
      }

      if (selectedCategoryId !== "all") {
        results = results.filter(d => 
          d.categoria.toLowerCase().includes(selectedCategoryId.toLowerCase()) ||
          d.subcategoria?.toLowerCase().includes(selectedCategoryId.toLowerCase()) ||
          d.hierarquia.some(h => h.toLowerCase().includes(selectedCategoryId.toLowerCase()))
        );
      }

      setDocuments(results);
      updateStats(results);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Erro ao carregar documentos.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (docs: Document[]) => {
    setStats({
      total: docs.length,
      pdf: docs.filter(d => d.tipo === 'pdf').length,
      excel: docs.filter(d => ['xlsx', 'xls', 'csv'].includes(d.tipo)).length,
      word: docs.filter(d => d.tipo === 'docx').length,
      indexed: docs.filter(d => d.indexed).length
    });
  };

  const handleCategorySelect = (categoryId: string, hierarchy: string[]) => {
    setSelectedCategoryId(categoryId);
    setCurrentHierarchy(hierarchy);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tipo = file.name.split('.').pop()?.toLowerCase() || 'bin';
      
      try {
        const docId = await db.documents.add({
          nome: file.name,
          tipo,
          categoria: currentHierarchy[currentHierarchy.length - 1] || 'Uploads',
          orgao: currentHierarchy[0] || 'Manual',
          hierarquia: currentHierarchy.length > 0 ? currentHierarchy : ['Manual', 'Uploads'],
          tamanho: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          dataUpload: Date.now(),
          tags: ['Manual', tipo.toUpperCase()],
          caminhoVirtual: `/user/${file.name}`,
          fileBlob: file,
          indexed: false,
          favorito: false
        });

        await indexDocument(docId);
        loadDocuments();
      } catch (err) {
        toast.error(`Erro ao processar ${file.name}`);
      }
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info("Iniciando sincronização com portais técnicos...");
    
    try {
      // Simulando raspagem de dados de portais oficiais
      await new Promise(r => setTimeout(r, 2000));
      
      const agencies = ["DER-SP", "DNIT", "ABNT"];
      const agency = agencies[Math.floor(Math.random() * agencies.length)];
      const docName = `${agency}_Norma_Tecnica_${Math.floor(Math.random() * 1000)}.pdf`;
      
      const docId = await db.documents.add({
        nome: docName,
        tipo: 'pdf',
        categoria: 'Normas Técnicas',
        orgao: agency,
        hierarquia: [agency, 'Normas Técnicas'],
        tamanho: "4.2 MB",
        dataUpload: Date.now(),
        tags: [agency, 'Sincronizado', 'Oficial'],
        caminhoVirtual: `/sync/${agency}/${docName}`,
        indexed: false,
        favorito: false
      });

      await indexDocument(docId);
      loadDocuments();
      toast.success(`Sincronização concluída! 1 novo documento de ${agency} importado.`);
    } catch (error) {
      toast.error("Erro na sincronização.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <LibraryHeader 
        stats={stats} 
        onUpload={handleFileUpload}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Sidebar Explorer */}
        <div className="w-72 flex-shrink-0 hidden md:flex flex-col gap-4">
          <LibraryExplorer 
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategoryId}
          />
          
          <Card className="glass-card mt-auto">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <BrainCircuit className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">IA PWA Engine</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Indexação local ativa. Sua biblioteca está protegida e disponível offline.
              </p>
              <Button variant="outline" size="sm" className="w-full text-[10px] h-7 gap-1">
                <RefreshCw className="h-3 w-3" /> Forçar Reindexação
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-shrink-0 border-none shadow-none bg-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <Badge variant="outline" className="h-7 px-3 flex-shrink-0 bg-muted/50 border-none">
                  {currentHierarchy.length > 0 ? currentHierarchy.join(" / ") : "Todos os Documentos"}
                </Badge>
                {searchTerm && (
                  <Badge variant="secondary" className="h-7 px-3 flex-shrink-0">
                    Busca: {searchTerm}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Pesquisar na biblioteca..." 
                    className="pl-9 h-9 bg-card"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex border rounded-md p-1 bg-card">
                  <Button 
                    variant={viewMode === "grid" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <p className="text-sm">Sincronizando base local...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed rounded-xl bg-muted/20">
                <div className="p-4 bg-muted rounded-full">
                  <Database className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Nenhum documento encontrado</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Não encontramos arquivos nesta categoria ou para sua pesquisa. Importe novos arquivos ou mude o filtro.
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" /> Começar Importação
                </Button>
              </div>
            ) : (
              <DocumentGrid 
                documents={documents} 
                viewMode={viewMode}
                onRefresh={loadDocuments}
                onPreview={(doc) => setPreviewDoc(doc)}
                onAsk={(doc) => {
                  setSelectedDocForAI(doc);
                  setIsAskingAI(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <DocumentViewer 
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <Dialog open={isAskingAI} onOpenChange={setIsAskingAI}>
        <DialogContent className="max-w-4xl p-0 h-[80vh] overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-muted/30">
              <h2 className="font-bold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Análise Técnica IA: {selectedDocForAI?.nome}
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
               <AskAI />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
