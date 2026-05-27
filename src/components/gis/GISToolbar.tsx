import { Button } from "@/components/ui/button";
import { 
  Ruler, 
  Square, 
  MousePointer2, 
  MapPin, 
  Trash2, 
  Copy, 
  Save, 
  Settings2,
  Maximize2,
  Sparkles,
  Layers,
  Search,
  ScanSearch
} from "lucide-react";
import { cn } from "@/lib/utils";

export type GISTool = 'select' | 'measure_dist' | 'measure_area' | 'draw_line' | 'draw_poly' | 'marker';

interface GISToolbarProps {
  activeTool: GISTool;
  onToolSelect: (tool: GISTool) => void;
  onClear: () => void;
  onSave: () => void;
  onAI: () => void;
  isInspectionMode: boolean;
  onInspectionModeToggle: () => void;
}

export default function GISToolbar({ 
  activeTool, 
  onToolSelect, 
  onClear, 
  onSave,
  onAI,
  isInspectionMode,
  onInspectionModeToggle
}: GISToolbarProps) {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Selecionar' },
    { id: 'measure_dist', icon: Ruler, label: 'Distância' },
    { id: 'measure_area', icon: Maximize2, label: 'Área' },
    { id: 'draw_line', icon: Search, label: 'Traçado' }, // Usando Search como placeholder para desenho livre se necessário
    { id: 'draw_poly', icon: Square, label: 'Polígono' },
    { id: 'marker', icon: MapPin, label: 'Ponto' },
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 p-1.5 bg-background/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl transition-all hover:bg-background/80">
      <div className="flex items-center gap-1 pr-2 border-r border-border/50">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "default" : "ghost"}
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl transition-all duration-300",
              activeTool === tool.id ? "shadow-lg shadow-primary/20 scale-110" : "hover:bg-primary/10"
            )}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            <tool.icon className={cn("h-4 w-4", activeTool === tool.id ? "animate-pulse" : "")} />
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1 pl-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
          onClick={onClear}
          title="Limpar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10"
          onClick={onAI}
          title="Análise IA"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <Button
          variant={isInspectionMode ? "default" : "ghost"}
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl transition-all duration-300",
            isInspectionMode ? "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 scale-110" : "text-orange-500 hover:bg-orange-500/10"
          )}
          onClick={onInspectionModeToggle}
          title="Modo Inspeção Técnica"
        >
          <ScanSearch className={cn("h-4 w-4", isInspectionMode ? "animate-pulse" : "")} />
        </Button>

        <Button
          variant="default"
          size="sm"
          className="h-9 px-4 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-1 shadow-lg shadow-primary/20"
          onClick={onSave}
        >
          <Save className="h-3.5 w-3.5 mr-2" /> Salvar GIS
        </Button>
      </div>
    </div>
  );
}
