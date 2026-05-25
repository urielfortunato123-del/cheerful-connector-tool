import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Calculator,
  BriefcaseBusiness,
  AlertTriangle,
  Library,
  Clock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stats = [
  { title: "Obras em Andamento", value: "12", icon: Activity, trend: "+2" },
  { title: "Orçamentos", value: "48", icon: Calculator, trend: "+5" },
  { title: "Projetos Ativos", value: "8", icon: BriefcaseBusiness, trend: "0" },
  { title: "Alertas Técnicos", value: "3", icon: AlertTriangle, trend: "+1", color: "text-red-500" },
  { title: "Normas Consultadas", value: "124", icon: Library, trend: "+12" },
  { title: "Economia (h)", value: "320", icon: Clock, trend: "+45" },
];

const data = [
  { name: "SP-300", val: 400 },
  { name: "SP-294", val: 300 },
  { name: "BR-153", val: 600 },
  { name: "BR-101", val: 200 },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || "text-primary"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend} este mês</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="glass-card col-span-2">
          <CardHeader>
            <CardTitle>Custos Financeiros por Trecho</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", border: "none" }} />
                <Bar dataKey="val" fill="#FF6B00">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#FF6B00" : "#0066CC"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Clima & Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-black/20">
                <p className="text-sm font-medium">Previsão: Ensolarado (28°C)</p>
                <p className="text-xs text-muted-foreground">Ideal para pavimentação</p>
              </div>
              <div className="p-3 rounded-lg bg-red-900/10 border border-red-900/20">
                <p className="text-sm font-medium text-red-500">Alerta Técnico: Ponte SP-300</p>
                <p className="text-xs text-muted-foreground">Inspeção necessária em 48h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Análise de Inteligência Geral
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </h3>
              <p className="text-muted-foreground max-w-xl">
                O DeepSeek V4 Flash analisou seus dados. Você tem 12 obras ativas e 3 alertas técnicos. 
                Deseja gerar um resumo executivo ou tirar dúvidas sobre as normas DNIT vigentes?
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2 font-bold shadow-xl shadow-primary/20">
            <Link to="/ai-assistant">
              Falar com Assistente Global
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

