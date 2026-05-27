import { 
  Database, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  FileSpreadsheet, 
  FileCode,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <div className="bg-card border-b p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Biblioteca Inteligente</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" /> 
              Sincronização DER-SP / DNIT • Offline-First PWA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Button className="gap-2 h-9 text-xs font-semibold">
              <Upload className="h-4 w-4" /> Importar Documentos
            </Button>
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={onUpload}
              accept=".pdf,.xlsx,.xls,.docx,.doc,.txt,.zip"
            />
          </div>
          <Button variant="outline" className="gap-2 h-9 text-xs" onClick={onSync} disabled={isSyncing}>
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} /> Sincronizar Portais
          </Button>
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

import { cn } from "@/lib/utils";
