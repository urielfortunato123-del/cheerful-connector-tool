import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TableSkeleton } from "@/components/ui/skeleton-loader";

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
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    const allEntries = await db.financial.toArray();
    const allProjects = await db.projects.toArray();
    setEntries(allEntries);
    setProjects(allProjects);
    setLoading(false);
  };


  const handleAddEntry = async () => {
    if (!newEntry.valor || !newEntry.descricao || !newEntry.projectId) {
      toast.error("Preencha todos os campos.");
      return;
    }

    const entryId = await db.financial.add({
      ...newEntry,
      data: Date.now()
    } as Financial);

    // Sync to projects? (future expansion)
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

  if (loading) return <TableSkeleton />;

  return (

    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3 uppercase">
            Fluxo <span className="text-primary">Financeiro</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Gestão de custos e medições por projeto • 2026</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 px-6 glass-card border-white/5 font-bold gap-2 uppercase text-[10px] tracking-widest">
            <Download className="h-4 w-4" /> Exportar Relatório
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-8 font-black shadow-[0_0_30px_rgba(255,107,0,0.2)] gap-2 uppercase tracking-widest text-[10px]">
                <Plus className="h-5 w-5" /> Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Lançamento Financeiro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Projeto</Label>
                  <Select onValueChange={(v) => setNewEntry({...newEntry, projectId: parseInt(v)})}>
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 font-bold">
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10">
                      {projects.map(p => <SelectItem key={p.id} value={p.id!.toString()}>{p.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo</Label>
                    <Select defaultValue="Saída" onValueChange={(v: any) => setNewEntry({...newEntry, tipo: v})}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="Entrada">Entrada (Receita)</SelectItem>
                        <SelectItem value="Saída">Saída (Despesa)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valor (R$)</Label>
                    <Input 
                      type="number" 
                      className="h-12 bg-white/5 border-white/10 font-black text-primary text-lg focus:border-primary/50"
                      value={newEntry.valor} 
                      onChange={e => setNewEntry({...newEntry, valor: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descrição / Fornecedor</Label>
                  <Input 
                    placeholder="Ex: Pagamento Medição 01" 
                    className="h-12 bg-white/5 border-white/10 font-bold focus:border-primary/50"
                    value={newEntry.descricao}
                    onChange={e => setNewEntry({...newEntry, descricao: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEntry} className="h-12 w-full font-black uppercase tracking-widest">Confirmar Lançamento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" /> Total Receitas
            </CardDescription>
            <CardTitle className="text-3xl font-black text-green-500 tracking-tighter">
              R$ {totals.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-500" /> Total Despesas
            </CardDescription>
            <CardTitle className="text-3xl font-black text-red-500 tracking-tighter">
              R$ {totals.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card bg-primary/5 border-primary/20 shadow-[0_0_30px_rgba(255,107,0,0.1)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <DollarSign className="h-3 w-3" /> Saldo Acumulado
            </CardDescription>
            <CardTitle className="text-3xl font-black text-primary tracking-tighter">
              R$ {(totals.entradas - totals.saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="glass-card border-white/5 lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Comparativo Fluxo</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Entradas vs Saídas Mensais</CardDescription>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-green-500" />
                 <span className="text-[9px] font-bold text-muted-foreground uppercase">Receita</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-red-500" />
                 <span className="text-[9px] font-bold text-muted-foreground uppercase">Despesa</span>
               </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#888" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Despesas por Projeto</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Distribuição de Custos</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-white/[0.02] py-6 px-8 border-b border-white/5">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">Extrato de Lançamentos</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">Histórico tecnológico de transações financeiras</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-10 px-6 glass-card border-white/10 font-bold uppercase text-[10px] tracking-widest gap-2">
            <Filter className="h-4 w-4" /> Filtrar Registros
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {entries.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <DollarSign className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-bold italic">Nenhum lançamento registrado no sistema.</p>
              </div>
            ) : (
              entries.sort((a,b) => b.data - a.data).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-5 px-8 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                      entry.tipo === 'Entrada' 
                      ? 'bg-green-500/5 text-green-500 border-green-500/20 group-hover:bg-green-500/10 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : 'bg-red-500/5 text-red-500 border-red-500/20 group-hover:bg-red-500/10 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    }`}>
                      {entry.tipo === 'Entrada' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{entry.descricao}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                          {projects.find(p => p.id === entry.projectId)?.nome}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">•</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {format(entry.data, 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className={`text-lg font-black tracking-tighter ${entry.tipo === 'Entrada' ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.tipo === 'Entrada' ? '+' : '-'} R$ {entry.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all" onClick={() => handleDelete(entry.id!)}>
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
