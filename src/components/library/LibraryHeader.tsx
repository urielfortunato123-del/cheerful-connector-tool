import { Library, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function LibraryHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Library className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca Técnica Inteligente</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Gerencie seus documentos técnicos do DER, DNIT e outros órgãos com assistência de IA.
        </p>
      </div>
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar em toda a biblioteca..." 
          className="pl-10 bg-muted/30 border-border/50 focus:bg-muted/50 transition-all"
        />
      </div>
    </div>
  );
}
