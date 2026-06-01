import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Activity,
  Calculator,
  BriefcaseBusiness,
  AlertTriangle,
  Library,
  Clock,
  TrendingUp,
  Cloud,
  Thermometer,
  Wind,
  Search,
  ChevronRight,
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  AreaChart, 
  Area, 
  LineChart, 
  Line 
} from "recharts";
import { Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stats = [
  { title: "Obras em Andamento", value: "12", icon: Activity, trend: "+2", sparkData: [2, 5, 3, 8, 5, 12, 12] },
  { title: "Orçamentos", value: "48", icon: Calculator, trend: "+5", sparkData: [10, 20, 15, 30, 48] },
  { title: "Projetos Ativos", value: "8", icon: BriefcaseBusiness, trend: "0", sparkData: [4, 6, 8, 8, 8] },
  { title: "Alertas Técnicos", value: "3", icon: AlertTriangle, trend: "+1", color: "text-red-500", sparkData: [1, 2, 1, 3, 3] },
  { title: "Normas Consultadas", value: "124", icon: Library, trend: "+12", sparkData: [50, 80, 90, 110, 124] },
  { title: "Economia (h)", value: "320h", icon: Clock, trend: "+45", sparkData: [100, 150, 200, 280, 320] },
];

const performanceData = [
  { name: "Jan", val: 400, target: 450 },
  { name: "Fev", val: 300, target: 400 },
  { name: "Mar", val: 600, target: 550 },
  { name: "Abr", val: 800, target: 700 },
  { name: "Mai", val: 700, target: 750 },
  { name: "Jun", val: 900, target: 850 },
];

const budgetData = [
  { name: "SP-300", val: 400, color: "#FF6B00" },
  { name: "SP-294", val: 300, color: "#0066CC" },
  { name: "BR-153", val: 600, color: "#8b5cf6" },
  { name: "BR-101", val: 200, color: "#10b981" },
];


function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (

    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-1">
            Dashboard <span className="text-primary">Geral</span>
          </h1>
          <p className="text-muted-foreground font-medium">Bem-vindo de volta, Engenheiro. Aqui está o status das rodovias.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass-card gap-2 border-white/5 h-11 px-6">
            <Clock className="h-4 w-4" />
            Hoje, 01 Junho
          </Button>
          <Button className="h-11 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
            <Bot className="h-4 w-4" />
            Gerar Relatório IA
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card group border-white/5 hover:border-primary/30 transition-all overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-white transition-colors">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || "text-primary"} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-muted/10 text-muted-foreground'}`}>
                    {stat.trend}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">vs. mês anterior</span>
                </div>
              </div>
              <div className="h-10 w-full mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.sparkData.map(v => ({v}))}>
                    <defs>
                      <linearGradient id={`sparkGradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stat.color ? "#ef4444" : "#FF6B00"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={stat.color ? "#ef4444" : "#FF6B00"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="v" 
                      stroke={stat.color ? "#ef4444" : "#FF6B00"} 
                      strokeWidth={2} 
                      fill={`url(#sparkGradient-${i})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="glass-card col-span-1 lg:col-span-8 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Desempenho de Obras</CardTitle>
              <CardDescription>Acompanhamento de progresso real vs planejado</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-white/20" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Planejado</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#888" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }} 
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="val" stroke="#FF6B00" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                <Area type="monotone" dataKey="target" stroke="#ffffff20" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="col-span-1 lg:col-span-4 space-y-6">
          <Card className="glass-card border-white/5 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" />
                Monitoramento Climático
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Thermometer className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">28°C</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Temperatura SP-300</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-500 text-sm font-bold flex items-center gap-1 justify-end">
                    <TrendingUp className="h-3 w-3" /> Ótimo
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Condição de Pavimentação</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold text-white">12 km/h</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-medium">Vento</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold text-white">15%</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-medium">Chuva</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Alertas Ativos (3)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {[
                { title: "Inspeção Ponte SP-300", time: "Há 2h", severity: "Alta" },
                { title: "Material pendente BR-153", time: "Há 5h", severity: "Média" },
                { title: "Medição Km 42 - SP-294", time: "Ontem", severity: "Baixa" }
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/item">
                  <div className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${alert.severity === 'Alta' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-500'}`} />
                    <div>
                      <p className="text-xs font-bold text-white group-hover/item:text-primary transition-colors">{alert.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{alert.time} • Prioridade {alert.severity}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant Section */}
      <Card className="border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5 relative overflow-hidden group hover:bg-primary/[0.08] transition-all">
        <div className="absolute -right-20 -top-20 h-64 w-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all" />
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-8">
            <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.3)] group-hover:scale-110 transition-transform duration-500">
              <Bot className="h-12 w-12 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-black flex items-center gap-3 text-white">
                InfraFlow Assistant AI
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </h3>
              <p className="text-muted-foreground font-medium max-w-2xl mt-1">
                Análise preditiva completa baseada em <span className="text-white font-bold">DNIT v4.0</span>. 
                Detectei uma discrepância na medição da BR-153. Deseja analisar o impacto financeiro agora?
              </p>
              <div className="flex gap-4 mt-4">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground">#DNIT-2024</div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground">#EFICIENCIA-OBRA</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" className="h-12 px-6 glass-card border-white/10 hover:border-white/20 font-bold">
              Ver Sugestão
            </Button>
            <Button asChild size="lg" className="h-12 px-8 shrink-0 gap-3 font-black shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:shadow-[0_0_40px_rgba(255,107,0,0.4)] transition-all">
              <Link to="/ai-assistant">
                Falar com Assistente
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {budgetData.map((project, i) => (
          <Card key={i} className="glass-card border-white/5 hover:border-white/10 transition-all overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-white group-hover:text-primary transition-colors">
                  {project.name.split('-')[1]}
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">R$ {project.val}k</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Investimento</p>
                </div>
              </div>
              <h4 className="font-bold text-white mb-2">{project.name} - Trecho Leste</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Progresso</span>
                  <span>{Math.floor(Math.random() * 40 + 60)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(255,107,0,0.5)]" 
                    style={{ width: `${Math.floor(Math.random() * 40 + 60)}%`, backgroundColor: project.color }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


