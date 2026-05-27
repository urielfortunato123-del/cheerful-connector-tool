import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Briefcase, 
  FileText, 
  User, 
  HardHat, 
  MapPin,
  Save,
  Plus
} from "lucide-react";
import { Project, db } from "@/lib/db";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GISProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export default function GISProjectModal({ 
  isOpen, 
  onClose, 
  onProjectCreated 
}: GISProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    nome: "",
    rodovia: "",
    contrato: "",
    cliente: "",
    tipoObra: "Pavimentação",
    kmInicial: 0,
    kmFinal: 10,
    lado: "Crescente",
    status: "Em Execução"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.rodovia) {
      toast.error("Nome e Rodovia são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newProject: Project = {
        ...formData,
        nome: formData.nome!,
        rodovia: formData.rodovia!,
        kmInicial: Number(formData.kmInicial) || 0,
        kmFinal: Number(formData.kmFinal) || 0,
        dataCriacao: Date.now(),
        status: formData.status as any || 'Em Execução',
        lado: formData.lado as any || 'Crescente'
      } as Project;

      const id = await db.projects.add(newProject);
      const savedProject = { ...newProject, id };
      
      toast.success("Projeto criado com sucesso!");
      onProjectCreated(savedProject);
      onClose();
      // Reset form
      setFormData({
        nome: "",
        rodovia: "",
        contrato: "",
        cliente: "",
        tipoObra: "Pavimentação",
        kmInicial: 0,
        kmFinal: 10,
        lado: "Crescente",
        status: "Em Execução"
      });
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Falha ao salvar projeto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-white/20 bg-background/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter leading-none">
                Novo Projeto GIS
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                Cadastrar nova frente de trabalho rodoviária
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Briefcase className="h-3 w-3" /> Nome do Projeto
              </Label>
              <Input 
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Duplicação Lote 04"
                className="bg-white/5 border-white/10 rounded-xl font-bold h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <FileText className="h-3 w-3" /> Contrato
              </Label>
              <Input 
                value={formData.contrato}
                onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                placeholder="Ex: CTR-088/2024"
                className="bg-white/5 border-white/10 rounded-xl font-bold h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Rodovia
              </Label>
              <Input 
                value={formData.rodovia}
                onChange={(e) => setFormData({ ...formData, rodovia: e.target.value })}
                placeholder="Ex: SP-270 / BR-116"
                className="bg-white/5 border-white/10 rounded-xl font-bold h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Cliente / Órgão
              </Label>
              <Input 
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                placeholder="Ex: DER-SP / DNIT"
                className="bg-white/5 border-white/10 rounded-xl font-bold h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                KM Inicial
              </Label>
              <Input 
                type="number"
                value={formData.kmInicial}
                onChange={(e) => setFormData({ ...formData, kmInicial: Number(e.target.value) })}
                className="bg-white/5 border-white/10 rounded-xl font-bold h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                KM Final
              </Label>
              <Input 
                type="number"
                value={formData.kmFinal}
                onChange={(e) => setFormData({ ...formData, kmFinal: Number(e.target.value) })}
                className="bg-white/5 border-white/10 rounded-xl font-bold h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                Sentido
              </Label>
              <Select value={formData.lado} onValueChange={(val) => setFormData({ ...formData, lado: val as any })}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl font-bold h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crescente">Crescente</SelectItem>
                  <SelectItem value="Decrescente">Decrescente</SelectItem>
                  <SelectItem value="N">Norte</SelectItem>
                  <SelectItem value="S">Sul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <HardHat className="h-3 w-3" /> Tipo de Obra
              </Label>
              <Select value={formData.tipoObra} onValueChange={(val) => setFormData({ ...formData, tipoObra: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl font-bold h-11">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pavimentação">Pavimentação</SelectItem>
                  <SelectItem value="Drenagem">Drenagem</SelectItem>
                  <SelectItem value="Duplicação">Duplicação</SelectItem>
                  <SelectItem value="Sinalização">Sinalização</SelectItem>
                  <SelectItem value="OAE">OAE (Pontes/Viadutos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status Inicial</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as any })}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl font-bold h-11">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em Planejamento">Em Planejamento</SelectItem>
                  <SelectItem value="Em Execução">Em Execução</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl font-bold uppercase text-[10px]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-xl font-black uppercase text-[10px] px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "Salvando..." : <><Save className="h-3.5 w-3.5 mr-2" /> Criar Projeto</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
