import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton, TableSkeleton } from "@/components/ui/skeleton-loader";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Bot, 
  Sparkles,
  TrendingUp,
  Download
} from "lucide-react";

export const Route = createFileRoute("/design-system")({
  component: DesignSystem,
});

function DesignSystem() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Design <span className="text-primary">System</span></h1>
        <p className="text-muted-foreground font-medium italic">Auditoria Visual de Componentes Premium</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Cards & Glassmorphism
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Standard Glass Card</CardTitle>
              <CardDescription>Default glassmorphism effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This component uses backdrop-filter blur and semi-transparent borders to achieve the premium look.</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Featured Card
              </CardTitle>
              <CardDescription>Primary accent variant</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">Action Primary</Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alert Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-bold uppercase text-red-500">Critical Status</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Buttons & Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" className="font-black uppercase tracking-widest shadow-lg shadow-primary/20">Premium Button</Button>
          <Button variant="outline" className="glass-card font-bold uppercase tracking-widest h-11 px-8">Outline Glass</Button>
          <Button variant="secondary" className="font-bold uppercase tracking-widest h-11 px-8">Secondary Action</Button>
          <Button variant="ghost" className="text-primary hover:bg-primary/10 font-black uppercase tracking-widest h-11 px-8">Ghost Primary</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          Loading States (Regression Audit)
        </h2>
        <div className="space-y-12">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Dashboard Loading Skeleton</p>
            <DashboardSkeleton />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Table Loading Skeleton</p>
            <TableSkeleton />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Accessibility & Typography
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter">Heading 1 Premium</h1>
            <h2 className="text-4xl font-black uppercase tracking-tight">Heading 2 Premium</h2>
            <h3 className="text-3xl font-bold">Heading 3 Bold</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Standard body text with proper line height for readability. We use OKLCH colors to ensure consistent contrast across themes.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">Status OK</Badge>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Sincronizado</Badge>
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Falha Crítica</Badge>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Accessibility Check</p>
              <p className="text-sm font-medium">Keyboard focus should be visible orange ring.</p>
              <Input placeholder="Teste de foco..." className="focus:ring-2 focus:ring-primary h-12" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
