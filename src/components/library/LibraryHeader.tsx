import { 
  Database, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  FileSpreadsheet, 
  FileCode,
  BrainCircuit,
  ShieldCheck,
  Download,
  ChevronDown,
  FileBarChart,
  ShieldAlert,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface LibraryHeaderProps {
  stats: {
    total: number;
    pdf: number;
    excel: number;
    word: number;
    indexed: number;
  };
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSync: () => void;
  isSyncing?: boolean;
}

export function LibraryHeader({ stats, onUpload, onSync, isSyncing }: LibraryHeaderProps) {
  return (
    <div className="bg-background/40 border-b border-white/5 p-6 space-y-6 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(255,107,0,0.1)] group transition-all">
            <Database className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Biblioteca <span className="text-primary">Inteligente</span></h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sincronização DER-SP / DNIT • Motor IA v4.2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Button className="h-11 px-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 gap-3">
              <Upload className="h-4 w-4" /> Importar Documentos
            </Button>
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={onUpload}
              accept=".pdf,.xlsx,.xls,.docx,.doc,.txt,.zip,.jpg,.jpeg,.png"
            />
          </div>
          <Button variant="outline" className="h-11 px-6 glass-card border-white/10 font-bold uppercase text-[10px] tracking-widest gap-2" onClick={onSync} disabled={isSyncing}>
            <RefreshCw className={cn("h-4 w-4 text-primary", isSyncing && "animate-spin")} /> Sincronizar Portais
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="h-11 px-6 glass-card border-primary/30 text-primary hover:bg-primary/10 font-black uppercase text-[10px] tracking-widest gap-2" 
              >
                <ShieldCheck className="h-4 w-4" /> Compliance <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 glass-card border-white/10 p-2">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-3">Centro de Conformidade</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="gap-3 cursor-pointer p-4 rounded-xl hover:bg-white/5 transition-all group" asChild>
                <a href="/security-report.html" target="_blank" rel="noopener noreferrer">
                  <ShieldAlert className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs">Relatório de Vulnerabilidades</span>
                    <span className="text-[10px] text-muted-foreground">Última varredura: Hoje</span>
                  </div>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 cursor-pointer p-4 rounded-xl hover:bg-white/5 transition-all group">
                <FileBarChart className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="font-bold text-white text-xs">Auditoria de Acessos</span>
                  <span className="text-[10px] text-muted-foreground">Log de operações DER-SP</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard 
          icon={<FileText className="h-4 w-4 text-blue-500" />} 
          label="Total Arquivos" 
          value={stats.total} 
        />
        <StatCard 
          icon={<FileText className="h-4 w-4 text-red-500" />} 
          label="Normas PDF" 
          value={stats.pdf} 
        />
        <StatCard 
          icon={<FileSpreadsheet className="h-4 w-4 text-green-500" />} 
          label="Planilhas" 
          value={stats.excel} 
        />
        <StatCard 
          icon={<FileCode className="h-4 w-4 text-amber-500" />} 
          label="Documentos" 
          value={stats.word} 
        />
        <StatCard 
          icon={<BrainCircuit className="h-4 w-4 text-primary" />} 
          label="Indexados IA" 
          value={stats.indexed} 
          highlight
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: number, highlight?: boolean }) {
  return (
    <Card className={cn("glass-card border-none shadow-sm", highlight && "bg-primary/5 border border-primary/20")}>
      <CardContent className="p-3 flex items-center gap-3">
        <div className="p-1.5 bg-background rounded-md shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
          <p className={cn("text-lg font-black", highlight ? "text-primary" : "text-foreground")}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
