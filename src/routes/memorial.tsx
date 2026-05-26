import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Sparkles, 
  Bot, 
  Save, 
  Printer,
  ChevronLeft,
  Settings2,
  Trash2,
  History as HistoryIcon
} from "lucide-react";
import { db, Memorial, Project } from "@/lib/db";
import { toast } from "sonner";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';


export const Route = createFileRoute("/memorial")({
  component: Memorials,
});

function Memorials() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [content, setContent] = useState("");
  const [template, setTemplate] = useState("DER-SP Standard");
  const [memorials, setMemorials] = useState<Memorial[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMemorials();
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    const all = await db.projects.toArray();
    setProjects(all);
    if (all.length > 0) setSelectedProjectId(all[0].id!.toString());
  };

  const loadMemorials = async () => {
    const all = await db.memorials
      .where('projectId').equals(parseInt(selectedProjectId))
      .toArray();
    setMemorials(all);
  };

  const generateWithIA = async () => {
    const project = projects.find(p => p.id === parseInt(selectedProjectId));
    if (!project) return;

    toast.info("IA analisando projeto e gerando memorial técnico...");
    
    try {
      const response = await (askGeneralAI as any)({
        data: {
          question: `Gere um Memorial Descritivo Técnico COMPLETO para o projeto: ${project.nome}. 
          Rodovia: ${project.rodovia}, KM ${project.kmInicial} ao ${project.kmFinal}. 
          Template: ${template}. 
          Siga rigorosamente as normas técnicas do órgão competente e use linguagem de engenharia pesada brasileira.`,
          context: "Geração de Memorial Descritivo via IA."
        }
      });
      
      setContent((response as any).answer);
      toast.success("Memorial gerado pela IA com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar memorial via IA. Usando fallback offline.");
      const generated = `MEMORIAL DESCRITIVO TÉCNICO\n\n1. OBJETO\nEste memorial refere-se ao projeto de ${project.nome}, localizado na rodovia ${project.rodovia}, entre o KM ${project.kmInicial} e o KM ${project.kmFinal}, no lado ${project.lado}.\n\n2. NORMAS APLICÁVEIS\nSerão seguidas rigorosamente as instruções do manual de pavimentação do DER-SP (ET-DE-P00/013) e normas ABNT NBR pertinentes.`;
      setContent(generated);
    }
  };

  const handleSave = async () => {
    if (!selectedProjectId || !content) return;

    await db.memorials.add({
      projectId: parseInt(selectedProjectId),
      conteudo: content,
      dataCriacao: Date.now()
    });

    toast.success("Memorial salvo na base local.");
    loadMemorials();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const project = projects.find(p => p.id === parseInt(selectedProjectId));
    
    doc.setFontSize(16);
    doc.text("INFRAFLOW - SISTEMA DE ENGENHARIA", 10, 20);
    doc.setFontSize(10);
    doc.text(`DATA: ${format(new Date(), 'dd/MM/yyyy')}`, 10, 26);
    
    doc.setFontSize(14);
    doc.text("MEMORIAL DESCRITIVO", 10, 40);
    
    doc.setFontSize(10);
    doc.text(`PROJETO: ${project?.nome || 'N/A'}`, 10, 50);
    doc.text(`RODOVIA: ${project?.rodovia || 'N/A'}`, 10, 56);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 10, 70);
    
    doc.save(`Memorial_${project?.nome || 'Projeto'}.pdf`);
    toast.success("PDF gerado e baixado.");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Memorial Descritivo
          </h1>
          <p className="text-muted-foreground mt-1">Gerador automático de memoriais e especificações técnicas</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2" onClick={exportPDF} disabled={!content}>
             <Download className="h-4 w-4" /> Exportar PDF
           </Button>
           <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handleSave} disabled={!content}>
             <Save className="h-4 w-4" /> Salvar Localmente
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 glass-card h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Projeto de Origem</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="glass-card">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id!.toString()}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template Normativo</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DER-SP Standard">DER-SP Standard</SelectItem>
                  <SelectItem value="DNIT 031/2006">DNIT 031/2006</SelectItem>
                  <SelectItem value="ABNT NBR 15575">ABNT NBR 15575</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" className="w-full gap-2 mt-2 group" onClick={generateWithIA}>
              <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse" />
              Gerar com IA
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 glass-card min-h-[600px] flex flex-col">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Editor de Conteúdo Técnico</CardTitle>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold">
                <span>{content.length} caracteres</span>
                <Badge variant="outline" className="h-4 text-[8px] border-primary/20 text-primary">Live Sync</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Textarea 
              className="w-full h-full min-h-[550px] border-none focus-visible:ring-0 p-8 font-serif leading-relaxed text-base bg-transparent resize-none"
              placeholder="O conteúdo do seu memorial aparecerá aqui..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" /> Memoriais Arquivados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memorials.map(m => (
            <Card key={m.id} className="glass-card hover:border-primary/30 transition-all group">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={async () => {
                    await db.memorials.delete(m.id!);
                    loadMemorials();
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="text-xs font-bold line-clamp-1">{m.conteudo.split('\n')[0]}</p>
                  <p className="text-[10px] text-muted-foreground">{format(m.dataCriacao, 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full h-7 text-[10px] uppercase font-bold" onClick={() => setContent(m.conteudo)}>
                  Restaurar no Editor
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
