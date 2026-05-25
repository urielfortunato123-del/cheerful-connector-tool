import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  Star, 
  ExternalLink, 
  ChevronRight,
  ShieldCheck,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/standards")({
  component: Standards,
});

function Standards() {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      title: "Normas DNIT",
      desc: "Especificações de serviço e manuais técnicos federais.",
      count: 420,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      link: "/library"
    },
    {
      title: "Manuais DER-SP",
      desc: "Instruções e normas para rodovias estaduais de SP.",
      count: 158,
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      link: "/library"
    },
    {
      title: "Normas ABNT",
      desc: "Normas brasileiras de pavimentação e geotecnia.",
      count: 89,
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      link: "/library"
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Base Normativa Rodoviária
        </h1>
        <p className="text-muted-foreground text-lg">Central de Inteligência Normativa (DNIT, DER e ABNT).</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar norma por código ou título (ex: DNIT 141, ET-DE-P00)..." 
            className="pl-10 h-11 glass-card"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="h-11 px-6">Pesquisar Base</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.title} to={category.link as any} className="block group">
            <Card className="glass-card hover:border-primary/50 transition-all h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={category.color}>{category.count} docs</Badge>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="mt-4">{category.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{category.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs font-bold text-primary gap-1">
                  Explorar Normas <ChevronRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-4 pt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" /> Normas Favoritadas
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { code: "DNIT 141/2010-ES", title: "Pavimentação - Base estabilizada granulometricamente", org: "DNIT" },
            { code: "ET-DE-P00/013", title: "Revestimento de CBUQ - DER-SP", org: "DER-SP" }
          ].map((norm) => (
            <div key={norm.code} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-border/50 shadow-sm">
                   <FileText className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{norm.code}</p>
                    <p className="text-[10px] text-muted-foreground">{norm.title}</p>
                 </div>
              </div>
              <Badge variant="secondary" className="text-[9px]">{norm.org}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
         <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
           <ShieldCheck className="h-8 w-8 text-primary" />
         </div>
         <div className="space-y-1 text-center md:text-left">
           <h4 className="font-bold">Validação Normativa Inteligente</h4>
           <p className="text-xs text-muted-foreground leading-relaxed">
             O InfraFlow valida automaticamente se o seu orçamento ou projeto está em conformidade com a última revisão das normas DER/DNIT armazenadas na biblioteca.
           </p>
         </div>
         <Button variant="outline" className="md:ml-auto whitespace-nowrap">Verificar Compliance</Button>
      </div>
    </div>
  );
}

function Button({ children, className, variant = "default", onClick }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };
  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
