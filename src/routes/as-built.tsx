import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock
} from "lucide-react";
import { db, AsBuilt, Project } from "@/lib/db";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const Route = createFileRoute("/as-built")({
  component: AsBuiltModule,
});

function AsBuiltModule() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [asBuiltRecords, setAsBuiltRecords] = useState<AsBuilt[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadRecords();
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    const all = await db.projects.toArray();
    setProjects(all);
    if (all.length > 0) setSelectedProjectId(all[0].id!.toString());
  };

  const loadRecords = async () => {
    const all = await db.asbuilt
      .where('projectId').equals(parseInt(selectedProjectId))
      .toArray();
    setAsBuiltRecords(all);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedProjectId) return;

    const newFiles = await Promise.all(Array.from(files).map(async (f) => ({
      nome: f.name,
      blob: f,
      tipo: f.name.split('.').pop()?.toLowerCase() || 'bin'
    })));

    await db.asbuilt.add({
      projectId: parseInt(selectedProjectId),
      arquivos: newFiles,
      dataUpload: Date.now(),
      observacoes: "Upload de arquivos As-Built"
    });

    toast.success("Documentação As-Built anexada com sucesso.");
    loadRecords();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-primary" />
            As-Built Digital
          </h1>
          <p className="text-muted-foreground mt-1">Conformidade técnica e documentação final de obra</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full md:w-[250px] glass-card">
              <SelectValue placeholder="Selecione o Projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => <SelectItem key={p.id} value={p.id!.toString()}>{p.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Novo As-Built
            </Button>
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
             <div className="flex items-center gap-2 mb-2">
               <AlertCircle className="h-4 w-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Checklist Obrigatório</span>
             </div>
             <div className="space-y-2">
                {[
                  "Desenhos Geométricos",
                  "Seções Transversais",
                  "Relatórios de Ensaios",
                  "Notas de Serviço"
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-[11px]">
                    <div className="h-3 w-3 rounded border border-primary/50" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {asBuiltRecords.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
             <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
             <p className="text-muted-foreground font-medium">Nenhum registro As-Built anexado.</p>
             <p className="text-xs text-muted-foreground mt-1">Selecione um projeto e suba os desenhos finais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {asBuiltRecords.map((record) => (
              <Card key={record.id} className="glass-card group overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold">{format(record.dataUpload, 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={async () => {
                      await db.asbuilt.delete(record.id!);
                      loadRecords();
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                   <div className="space-y-3">
                      <p className="text-xs text-muted-foreground italic">"{record.observacoes}"</p>
                      <div className="grid grid-cols-1 gap-2">
                        {record.arquivos.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-background border border-border/50 hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                               {file.tipo === 'pdf' ? <FileText className="h-4 w-4 text-red-500" /> : <ImageIcon className="h-4 w-4 text-blue-500" />}
                               <span className="text-[11px] font-bold truncate max-w-[200px]">{file.nome}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              const url = URL.createObjectURL(file.blob);
                              window.open(url);
                            }}>
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                         <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-500 bg-green-500/5">
                           <CheckCircle2 className="h-3 w-3 mr-1" /> Validado localmente
                         </Badge>
                         <Button variant="link" className="h-7 text-[10px] text-primary">Gerar Relatório Final</Button>
                      </div>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
