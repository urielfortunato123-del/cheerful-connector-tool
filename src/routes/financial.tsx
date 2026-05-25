import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
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
  BarChart3, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  DollarSign,
  PieChart as PieChartIcon,
  Filter,
  Trash2
} from "lucide-react";
import { db, Financial, Project } from "@/lib/db";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const Route = createFileRoute("/financial")({
  component: FinancialDashboard,
});

function FinancialDashboard() {
  const [entries, setEntries] = useState<Financial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<Financial>>({
    tipo: 'Saída',
    valor: 0,
    descricao: '',
    projectId: undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allEntries = await db.financial.toArray();
    const allProjects = await db.projects.toArray();
    setEntries(allEntries);
    setProjects(allProjects);
  };

  const handleAddEntry = async () => {
    if (!newEntry.valor || !newEntry.descricao || !newEntry.projectId) {
      toast.error("Preencha todos os campos.");
      return;
    }

    await db.financial.add({
      ...newEntry,
      data: Date.now()
    } as Financial);

    toast.success("Lançamento realizado com sucesso.");
    setIsDialogOpen(false);
    loadData();
    setNewEntry({ tipo: 'Saída', valor: 0, descricao: '', projectId: undefined });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Excluir este lançamento?")) {
      await db.financial.delete(id);
      loadData();
    }
  };

  const totals = entries.reduce((acc, curr) => {
    if (curr.tipo === 'Entrada') acc.entradas += curr.valor;
    else acc.saidas += curr.valor;
    return acc;
  }, { entradas: 0, saidas: 0 });

  const chartData = [
    { name: 'Entradas', value: totals.entradas },
    { name: 'Saídas', value: totals.saidas },
  ];

  const projectDistribution = projects.map(p => {
    const projectTotal = entries
      .filter(e => e.projectId === p.id)
      .reduce((acc, e) => acc + (e.tipo === 'Saída' ? e.valor : 0), 0);
    return { name: p.nome, value: projectTotal };
  }).filter(p => p.value > 0);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Fluxo Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">Gestão de custos e medições por projeto</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar Relatório</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card">
              <DialogHeader>
                <DialogTitle>Lançamento Financeiro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Projeto</Label>
                  <Select onValueChange={(v) => setNewEntry({...newEntry, projectId: parseInt(v)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id!.toString()}>{p.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select defaultValue="Saída" onValueChange={(v: any) => setNewEntry({...newEntry, tipo: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrada">Entrada (Receita)</SelectItem>
                        <SelectItem value="Saída">Saída (Despesa)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Valor (R$)</Label>
                    <Input 
                      type="number" 
                      value={newEntry.valor} 
                      onChange={e => setNewEntry({...newEntry, valor: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Descrição / Fornecedor</Label>
                  <Input 
                    placeholder="Ex: Pagamento Medição 01" 
                    value={newEntry.descricao}
                    onChange={e => setNewEntry({...newEntry, descricao: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEntry}>Confirmar Lançamento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> Total Receitas</CardDescription>
            <CardTitle className="text-2xl text-green-500">R$ {totals.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-500" /> Total Despesas</CardDescription>
            <CardTitle className="text-2xl text-red-500">R$ {totals.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-primary">Saldo Acumulado</CardDescription>
            <CardTitle className="text-2xl text-primary">R$ {(totals.entradas - totals.saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Comparativo Fluxo</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><PieChartIcon className="h-4 w-4" /> Despesas por Projeto</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Extrato de Lançamentos</CardTitle>
            <CardDescription>Histórico completo de entradas e saídas</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Filtrar</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground italic">Nenhum lançamento registrado.</p>
            ) : (
              entries.sort((a,b) => b.data - a.data).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${entry.tipo === 'Entrada' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {entry.tipo === 'Entrada' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{entry.descricao}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {projects.find(p => p.id === entry.projectId)?.nome} • {format(entry.data, 'dd/MM/yy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-black ${entry.tipo === 'Entrada' ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.tipo === 'Entrada' ? '+' : '-'} R$ {entry.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(entry.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
