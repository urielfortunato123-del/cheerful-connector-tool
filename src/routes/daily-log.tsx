import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BookOpen, 
  Cloud, 
  Sun, 
  CloudRain, 
  Users, 
  Camera, 
  Save, 
  Plus,
  History,
  Calendar as CalendarIcon,
  Trash2
} from "lucide-react";
import { db, DailyLog, Project } from "@/lib/db";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/daily-log")({
  component: DailyLogs,
});

function DailyLogs() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentLog, setCurrentLog] = useState<Partial<DailyLog>>({
    clima: "Bom",
    equipe: "",
    observacoes: "",
    fotos: []
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadLogs();
    }
  }, [selectedProjectId, date]);

  const loadProjects = async () => {
    const all = await db.projects.toArray();
    setProjects(all);
    if (all.length > 0) setSelectedProjectId(all[0].id!.toString());
  };

  const loadLogs = async () => {
    const startOfDay = new Date(date).setHours(0,0,0,0);
    const endOfDay = new Date(date).setHours(23,59,59,999);
    
    const dayLogs = await db.dailyLogs
      .where('projectId').equals(parseInt(selectedProjectId))
      .filter(log => log.data >= startOfDay && log.data <= endOfDay)
      .toArray();

    if (dayLogs.length > 0) {
      setCurrentLog(dayLogs[0]);
    } else {
      setCurrentLog({
        clima: "Bom",
        equipe: "",
        observacoes: "",
        fotos: []
      });
    }
    
    // Load last 5 logs for history
    const history = await db.dailyLogs
      .where('projectId').equals(parseInt(selectedProjectId))
      .reverse()
      .limit(5)
      .toArray();
    setLogs(history);
  };

  const handleSave = async () => {
    if (!selectedProjectId) return;

    const logData = {
      ...currentLog,
      projectId: parseInt(selectedProjectId),
      data: date.getTime()
    } as DailyLog;

    const startOfDay = new Date(date).setHours(0,0,0,0);
    const endOfDay = new Date(date).setHours(23,59,59,999);
    
    const existing = await db.dailyLogs
      .where('projectId').equals(parseInt(selectedProjectId))
      .filter(log => log.data >= startOfDay && log.data <= endOfDay)
      .first();

    if (existing) {
      await db.dailyLogs.update(existing.id!, logData);
      toast.success("Diário atualizado com sucesso!");
    } else {
      await db.dailyLogs.add(logData);
      toast.success("Diário registrado com sucesso!");
    }
    loadLogs();
  };

  const deleteLog = async (id: number) => {
    if (confirm("Excluir este registro?")) {
      await db.dailyLogs.delete(id);
      loadLogs();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Diário de Obra Digital
          </h1>
          <p className="text-muted-foreground mt-1">Registro diário de clima, equipe e ocorrências técnicas</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full md:w-[200px] glass-card">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => <SelectItem key={p.id} value={p.id!.toString()}>{p.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("gap-2 glass-card", !date && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : "Data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="bg-card" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg flex items-center justify-between">
                Registro do Dia {format(date, "dd/MM")}
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Modo Offline</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Condição Climática</Label>
                  <div className="flex gap-2">
                    {[
                      { icon: Sun, label: "Bom", color: "text-amber-500" },
                      { icon: Cloud, label: "Nublado", color: "text-blue-400" },
                      { icon: CloudRain, label: "Chuva", color: "text-blue-600" }
                    ].map(c => (
                      <Button 
                        key={c.label}
                        variant={currentLog.clima === c.label ? "default" : "outline"}
                        className="flex-1 gap-2 h-10"
                        onClick={() => setCurrentLog({...currentLog, clima: c.label})}
                      >
                        <c.icon className={cn("h-4 w-4", currentLog.clima === c.label ? "text-white" : c.color)} />
                        {c.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Equipe / Efetivo</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Ex: 1 encarregado, 4 ajudantes" 
                        className="pl-9"
                        value={currentLog.equipe}
                        onChange={e => setCurrentLog({...currentLog, equipe: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Relato de Ocorrências / Serviços Executados</Label>
                <Textarea 
                  placeholder="Descreva as atividades, paradas, visitas técnicas e equipamentos..." 
                  className="min-h-[150px] resize-none focus-visible:ring-primary/20"
                  value={currentLog.observacoes}
                  onChange={e => setCurrentLog({...currentLog, observacoes: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Registro Fotográfico</Label>
                  <Button variant="outline" size="sm" className="gap-2 h-8 text-[11px]"><Camera className="h-3.5 w-3.5" /> Anexar Fotos</Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-[10px] font-bold">ADD FOTO</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button className="w-full gap-2 shadow-lg shadow-primary/20" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Salvar Diário de Obra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {logs.length === 0 ? (
                  <p className="p-6 text-center text-xs text-muted-foreground">Nenhum registro anterior.</p>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-primary">{format(log.data, "dd/MM/yyyy")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">{log.clima}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteLog(log.id!)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                        "{log.observacoes || "Sem observações"}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
             <div className="flex items-center gap-2 text-primary">
               <BookOpen className="h-4 w-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Dica Técnica</span>
             </div>
             <p className="text-[10px] text-muted-foreground leading-relaxed">
               O Diário de Obra é o documento legal mais importante para fundamentar pleitos de reequilíbrio econômico e prorrogação de prazo junto ao DER/DNIT.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
