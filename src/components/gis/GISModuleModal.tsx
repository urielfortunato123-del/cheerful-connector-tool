import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Briefcase, 
  Ruler, 
  FileText, 
  Calendar, 
  Save,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { MapFeature, Project } from "@/lib/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface GISModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: MapFeature | null;
  projects: Project[];
  onExecute: (dest: string, projectId: number) => void;
}

export default function GISModuleModal({ 
  isOpen, 
  onClose, 
  feature, 
  projects, 
  onExecute 
}: GISModuleModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const modules = [
    { id: 'budget', label: 'Criar Orçamento', icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'project', label: 'Criar Projeto', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'measurement', label: 'Criar Medição', icon: Ruler, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'memorial', label: 'Gerar Memorial (IA)', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'log', label: 'Criar Diário', icon: Calendar, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'save', label: 'Salvar no Mapa', icon: Save, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-white/20 bg-background/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Integrar Geometria
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecione o destino operacional para este levantamento geoespacial.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Vincular a Projeto Existente</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="bg-background/50 border-white/10 h-10">
                <SelectValue placeholder="Selecione um projeto..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id?.toString() || ""}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => onExecute(m.id, parseInt(selectedProjectId))}
                disabled={!selectedProjectId && m.id !== 'save'}
                className="group flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className={`${m.bg} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-tighter">{m.label}</div>
                  <div className="text-[9px] text-muted-foreground line-clamp-1">Enviar dados geo</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="text-[10px] font-bold text-primary uppercase mb-1 flex items-center gap-2">
            <Save className="h-3 w-3" /> Resumo do Levantamento
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] text-muted-foreground uppercase">Extensão</div>
              <div className="text-sm font-black">{feature?.properties.distance} km</div>
            </div>
            {feature?.properties.area && (
              <div>
                <div className="text-[9px] text-muted-foreground uppercase">Área</div>
                <div className="text-sm font-black">{feature?.properties.area} km²</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
