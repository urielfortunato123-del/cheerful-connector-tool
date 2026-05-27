import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Briefcase, 
  Ruler, 
  FileText, 
  Calendar, 
  Save,
  ArrowUpRight,
  ChevronRight,
  Settings2,
  Edit3
} from "lucide-react";
import { MapFeature, Project } from "@/lib/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface GISModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: MapFeature | null;
  projects: Project[];
  selectedProjectId?: number | null;
  isEditMode?: boolean;
  onExecute: (dest: string, projectId: number, unit: string) => void;
  onUpdate?: (id: number, updates: any) => void;
}

export default function GISModuleModal({ 
  isOpen, 
  onClose, 
  feature, 
  projects, 
  selectedProjectId,
  isEditMode = false,
  onExecute,
  onUpdate
}: GISModuleModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (feature) {
      setEditName(feature.name);
      setSelectedUnit(feature.type === 'line' ? 'km' : 'km²');
    }
    
    if (selectedProjectId) {
      setSelectedId(selectedProjectId.toString());
    }
  }, [feature, isOpen, selectedProjectId]);

  const units = useMemo(() => {
    if (feature?.type === 'line') return ['mm', 'cm', 'm', 'km'];
    if (feature?.type === 'area') return ['m²', 'hectares', 'km²'];
    return [];
  }, [feature]);

  const modules = [
    { id: 'budget', label: 'Orçamento', icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-500/10', desc: 'Enviar para planilha' },
    { id: 'measurement', label: 'Medição', icon: Ruler, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Vincular a trecho medido' },
    { id: 'project', label: 'Projeto', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Definir eixo projetado' },
    { id: 'memorial', label: 'Memorial', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Gerar texto via IA' },
    { id: 'log', label: 'Diário', icon: Calendar, color: 'text-cyan-500', bg: 'bg-cyan-500/10', desc: 'Registrar ocorrência' },
    { id: 'save', label: 'Mapa', icon: Save, color: 'text-primary', bg: 'bg-primary/10', desc: 'Apenas salvar geometria' },
  ];

  const handleExecute = (moduleId: string) => {
    onExecute(moduleId, parseInt(selectedId) || 0, selectedUnit);
  };

  const handleSaveName = () => {
    if (feature?.id && onUpdate) {
      onUpdate(feature.id, { name: editName });
    }
  };

  const displayQuantity = useMemo(() => {
    if (!feature) return '0';
    let val = feature.properties.distance || feature.properties.area || 0;
    
    if (selectedUnit === 'm') return (val * 1000).toFixed(2);
    if (selectedUnit === 'hectares') return (val * 100).toFixed(2);
    if (selectedUnit === 'm²') return (val * 1000000).toFixed(2);
    
    return val.toString();
  }, [feature, selectedUnit]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] border-white/20 bg-background/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/20 rounded-2xl">
              {isEditMode ? <Edit3 className="h-6 w-6 text-primary" /> : <ArrowUpRight className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter leading-none">
                {isEditMode ? 'Editar Geometria' : 'Processar Geo-Dados'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                Central de Integração Operacional
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          {isEditMode && (
            <div className="space-y-3 p-5 rounded-[2rem] bg-primary/5 border border-primary/10">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Edit3 className="h-3 w-3" /> Renomear Levantamento
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-background/50 border-white/10 h-10 font-bold"
                  placeholder="Nome do objeto..."
                />
                <Button onClick={handleSaveName} className="font-black uppercase text-[10px] h-10 px-6 rounded-xl">
                  Atualizar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 p-5 rounded-[2rem] bg-white/5 border border-white/5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Settings2 className="h-3 w-3" /> Unidade de Medida
              </Label>
              <RadioGroup value={selectedUnit} onValueChange={setSelectedUnit} className="grid grid-cols-2 gap-2">
                {units.map((u) => (
                  <div key={u} className="flex items-center space-x-2 bg-background/40 p-2 rounded-xl border border-white/5 hover:bg-background/60 transition-colors">
                    <RadioGroupItem value={u} id={`unit-${u}`} />
                    <Label htmlFor={`unit-${u}`} className="text-[10px] font-bold uppercase cursor-pointer">{u}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3 p-5 rounded-[2rem] bg-white/5 border border-white/5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Projeto Destino</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="bg-background/50 border-white/10 h-10 rounded-xl text-xs font-bold">
                  <SelectValue placeholder="Selecione o projeto..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id?.toString() || ""} className="text-xs font-medium">{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => handleExecute(m.id)}
                disabled={!selectedProjectId && m.id !== 'save'}
                className="group flex flex-col gap-2 p-4 rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.05] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-left relative overflow-hidden shadow-lg"
              >
                <div className={`${m.bg} w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-tighter mb-0.5">{m.label}</div>
                  <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">{m.desc}</div>
                </div>
                <ChevronRight className="absolute bottom-4 right-4 h-4 w-4 text-white/10 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 p-6 rounded-[2.5rem] bg-primary/10 border border-primary/20 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Ruler className="h-3 w-3" /> Valor Resultante
              </div>
              <div className="text-3xl font-black tracking-tighter flex items-baseline gap-2">
                {displayQuantity}
                <span className="text-sm font-bold text-primary uppercase">{selectedUnit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Geometria</div>
              <div className="text-xs font-black uppercase px-3 py-1 bg-background/50 rounded-full border border-white/10">
                {feature?.type}
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
