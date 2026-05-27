import { useState, useMemo } from "react";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Star, 
  Clock, 
  Check,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Project } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface GISProjectSelectorProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelect: (projectId: number) => void;
  onToggleFavorite?: (projectId: number) => void;
  onCreateNew: () => void;
}

export default function GISProjectSelector({ 
  projects, 
  selectedProjectId, 
  onSelect, 
  onToggleFavorite,
  onCreateNew 
}: GISProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const favoriteProjects = useMemo(() => 
    projects.filter(p => p.favorito).slice(0, 5),
    [projects]
  );

  const recentProjects = useMemo(() => 
    [...projects].sort((a, b) => b.dataCriacao - a.dataCriacao).slice(0, 3),
    [projects]
  );

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[280px] justify-between bg-background/60 backdrop-blur-xl border-white/20 h-10 rounded-xl hover:bg-background/80 transition-all shadow-xl group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="truncate font-black uppercase text-[10px] tracking-tighter">
                {selectedProject ? selectedProject.nome : "Selecione o Projeto"}
              </span>
            </div>
            <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 border-white/10 bg-background/95 backdrop-blur-3xl rounded-[2rem] shadow-2xl overflow-hidden">
          <Command className="bg-transparent">
            <div className="p-3 border-b border-white/5 bg-white/5">
              <CommandInput 
                placeholder="Buscar projeto..." 
                className="h-9 border-none focus:ring-0 bg-transparent text-xs font-bold"
                onValueChange={setSearch}
              />
            </div>
            <CommandList className="max-h-[400px]">
              <CommandEmpty className="py-6 text-center">
                <div className="flex flex-col items-center gap-2 opacity-50">
                  <LayoutGrid className="h-8 w-8 mb-1" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhum projeto encontrado</p>
                </div>
              </CommandEmpty>
              
              <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-widest text-primary/50 px-2">Ações Rápidas</span>}>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    onCreateNew();
                  }}
                  className="flex items-center gap-2 py-3 cursor-pointer"
                >
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-tighter">Novo Projeto</div>
                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Criar nova frente de trabalho</div>
                  </div>
                </CommandItem>
              </CommandGroup>

              {favoriteProjects.length > 0 && !search && (
                <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2">Favoritos</span>}>
                  {favoriteProjects.map((p) => (
                    <CommandItem
                      key={p.id}
                      onSelect={() => {
                        onSelect(p.id!);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold uppercase truncate">{p.nome}</span>
                      </div>
                      {selectedProjectId === p.id && <Check className="h-3 w-3 text-primary" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {recentProjects.length > 0 && !search && (
                <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2">Recentes</span>}>
                  {recentProjects.map((p) => (
                    <CommandItem
                      key={p.id}
                      onSelect={() => {
                        onSelect(p.id!);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase truncate">{p.nome}</span>
                      </div>
                      {selectedProjectId === p.id && <Check className="h-3 w-3 text-primary" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator className="bg-white/5" />
              
              <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2">Todos os Projetos</span>}>
                {projects.map((p) => (
                  <CommandItem
                    key={p.id}
                    onSelect={() => {
                      onSelect(p.id!);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between py-3 cursor-pointer group"
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-[11px] font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
                        {p.nome}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 font-bold uppercase border-white/10">
                          {p.rodovia}
                        </Badge>
                        <span className="text-[8px] text-muted-foreground font-medium truncate">
                          KM {p.kmInicial} - {p.kmFinal}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onToggleFavorite && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-yellow-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(p.id!);
                          }}
                        >
                          <Star className={cn("h-3 w-3", p.favorito ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                        </Button>
                      )}
                      {selectedProjectId === p.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
