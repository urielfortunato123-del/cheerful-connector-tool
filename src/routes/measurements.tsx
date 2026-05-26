import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Ruler, 
  Plus, 
  Search, 
  FileText, 
  Camera, 
  Trash2,
  CheckCircle2,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { db, Measurement, Project } from "@/lib/db";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/measurements")({
  component: Measurements,
});

function Measurements() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({
    projectId: undefined,
    tipoServico: "",
    quantidade: 0,
    unidade: "m2",
    valor: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allProjects = await db.projects.toArray();
    const allMeasurements = await db.measurements.toArray();
    setProjects(allProjects);
    setMeasurements(allMeasurements);
  };

  const handleAddMeasurement = async () => {
    if (!newMeasurement.projectId || !newMeasurement.tipoServico || !newMeasurement.quantidade) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    const measurementId = await db.measurements.add({
      ...newMeasurement,
      data: Date.now(),
      fotos: []
    } as Measurement);

    // Automate financial output for this measurement
    if (newMeasurement.valor && newMeasurement.quantidade) {
      await db.financial.add({
        projectId: newMeasurement.projectId,
        tipo: 'Saída',
        valor: newMeasurement.quantidade * newMeasurement.valor,
        descricao: `Medição: ${newMeasurement.tipoServico}`,
        data: Date.now()
      });
      toast.info("Gasto financeiro vinculado automaticamente.");
    }

    // Adicionar automaticamente ao financeiro como "Saída" para controle de custos? 
    // Ou talvez deixar como opcional. Por agora apenas na tabela de medição.
    
    toast.success("Medição registrada com sucesso!");
    setIsDialogOpen(false);
    loadData();
    setNewMeasurement({ projectId: undefined, tipoServico: "", quantidade: 0, unidade: "m2", valor: 0 });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Excluir esta medição?")) {
      await db.measurements.delete(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Ruler className="h-8 w-8 text-primary" />
            Medições de Campo
          </h1>
          <p className="text-muted-foreground mt-1">Controle de quantitativos executados em obra</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Nova Medição
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] glass-card">
            <DialogHeader>
              <DialogTitle>Registrar Medição</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Projeto</Label>
                <Select onValueChange={(v) => setNewMeasurement({...newMeasurement, projectId: parseInt(v)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id!.toString()}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Serviço / Item TPU</Label>
                <Input 
                  placeholder="Ex: CBUQ Camada de Rolamento" 
                  value={newMeasurement.tipoServico}
                  onChange={e => setNewMeasurement({...newMeasurement, tipoServico: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quantidade</Label>
                  <Input 
                    type="number" 
                    value={newMeasurement.quantidade}
                    onChange={e => setNewMeasurement({...newMeasurement, quantidade: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Select defaultValue="m2" onValueChange={(v) => setNewMeasurement({...newMeasurement, unidade: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Metros (m)</SelectItem>
                      <SelectItem value="m2">M²</SelectItem>
                      <SelectItem value="m3">M³</SelectItem>
                      <SelectItem value="t">Toneladas (t)</SelectItem>
                      <SelectItem value="un">Unidade (un)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Valor Unitário (R$)</Label>
                <Input 
                  type="number" 
                  value={newMeasurement.valor}
                  onChange={e => setNewMeasurement({...newMeasurement, valor: parseFloat(e.target.value)})}
                />
              </div>
              <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-bold uppercase">Anexar Foto de Campo</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMeasurement}>Salvar Medição</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {measurements.length === 0 ? (
          <Card className="border-dashed bg-muted/20 py-12 text-center">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhuma medição registrada.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurements.sort((a,b) => b.data - a.data).map((m) => (
              <Card key={m.id} className="glass-card hover:border-primary/30 transition-all group">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{m.tipoServico}</p>
                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                          {projects.find(p => p.id === m.projectId)?.nome}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleDelete(m.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-4">
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Quantitativo</p>
                      <p className="text-sm font-bold">{m.quantidade} {m.unidade}</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Vlr. Unitário</p>
                      <p className="text-sm font-bold">R$ {m.valor.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Total Item</p>
                      <p className="text-sm font-black text-primary">R$ {(m.quantidade * m.valor).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                     <span className="text-[10px] text-muted-foreground flex items-center gap-1 italic">
                       <Calendar className="h-3 w-3" /> {format(m.data, 'dd/MM/yyyy HH:mm')}
                     </span>
                     <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1"><Camera className="h-3 w-3" /> Ver Fotos</Button>
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
