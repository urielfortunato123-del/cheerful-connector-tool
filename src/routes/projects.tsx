import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TableSkeleton } from "@/components/ui/skeleton-loader";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  HardHat, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit,
  FolderOpen,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db, Project } from "@/lib/db";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/projects")({
  component: Projects,
});

function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    nome: "",
    rodovia: "",
    kmInicial: 0,
    kmFinal: 0,
    lado: "Crescente",
    status: "Em Planejamento"
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const allProjects = await db.projects.toArray();
    setProjects(allProjects);
    setLoading(false);
  };


  const handleCreateProject = async () => {
    if (!newProject.nome || !newProject.rodovia) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    try {
      await db.projects.add({
        ...newProject,
        dataCriacao: Date.now()
      } as Project);
      
      toast.success("Projeto criado com sucesso!");
      setIsDialogOpen(false);
      loadProjects();
      setNewProject({
        nome: "",
        rodovia: "",
        kmInicial: 0,
        kmFinal: 0,
        lado: "Crescente",
        status: "Em Planejamento"
      });
    } catch (error) {
      toast.error("Erro ao criar projeto.");
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm("Deseja realmente excluir este projeto?")) {
      await db.projects.delete(id);
      toast.success("Projeto excluído.");
      loadProjects();
    }
  };

  const filteredProjects = projects.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rodovia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <TableSkeleton />;

  return (

    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">
            Gestão de <span className="text-primary">Projetos</span>
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Engenharia Rodoviária • 2026
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 font-black shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:shadow-[0_0_40px_rgba(255,107,0,0.4)] transition-all gap-3 uppercase tracking-wider">
              <Plus className="h-5 w-5" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-card border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">Criar Novo Projeto</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium italic">Insira os dados técnicos da rodovia e trecho.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="nome" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome do Projeto / Objeto</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Duplicação SP-300" 
                  className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-bold"
                  value={newProject.nome}
                  onChange={e => setNewProject({...newProject, nome: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="rodovia" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rodovia</Label>
                  <Input 
                    id="rodovia" 
                    placeholder="Ex: SP-300" 
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-bold"
                    value={newProject.rodovia}
                    onChange={e => setNewProject({...newProject, rodovia: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lado" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lado / Pista</Label>
                  <Select 
                    value={newProject.lado} 
                    onValueChange={(v: any) => setNewProject({...newProject, lado: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 font-bold">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10">
                      <SelectItem value="Crescente">Crescente</SelectItem>
                      <SelectItem value="Decrescente">Decrescente</SelectItem>
                      <SelectItem value="N">Norte</SelectItem>
                      <SelectItem value="S">Sul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="kmInit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">KM Inicial</Label>
                  <Input 
                    id="kmInit" 
                    type="number" 
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-bold"
                    value={newProject.kmInicial}
                    onChange={e => setNewProject({...newProject, kmInicial: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kmFinal" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">KM Final</Label>
                  <Input 
                    id="kmFinal" 
                    type="number" 
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-bold"
                    value={newProject.kmFinal}
                    onChange={e => setNewProject({...newProject, kmFinal: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="h-12 px-6 glass-card border-white/10 hover:border-white/20 font-bold uppercase text-[10px]" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateProject} className="h-12 px-8 font-black uppercase text-[10px] tracking-widest">Salvar Projeto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input 
          placeholder="Pesquisar projetos ativos, rodovias ou trechos técnicos..." 
          className="h-16 pl-12 bg-white/5 border-white/5 focus:border-primary/30 transition-all rounded-2xl font-bold text-lg placeholder:font-medium placeholder:text-muted-foreground/50 shadow-inner"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] p-24 text-center group hover:border-primary/20 transition-all">
          <FolderOpen className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-xl text-muted-foreground font-black uppercase tracking-tighter">Vazio Tecnico</p>
          <p className="text-muted-foreground/60 max-w-xs mx-auto mt-2 font-medium italic">Nenhum projeto rodoviário encontrado nos registros digitais.</p>
          <Button variant="link" onClick={() => setIsDialogOpen(true)} className="text-primary mt-6 font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-transform">
            Injetar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="glass-card group border-white/5 hover:border-primary/30 transition-all relative overflow-hidden flex flex-col min-h-[400px]">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl" onClick={() => handleDeleteProject(project.id!)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border-0 ${
                    project.status === 'Em Execução' ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]' :
                    project.status === 'Em Planejamento' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(255,107,0,0.15)]' :
                    'bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  }`}>
                    {project.status}
                  </Badge>
                  <span className="text-[10px] font-black text-muted-foreground/50 tracking-tighter">ID #{String(project.id).padStart(4, '0')}</span>
                </div>
                <CardTitle className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight line-clamp-2 uppercase">
                  {project.nome}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2 font-bold text-muted-foreground italic">
                  <MapPin className="h-4 w-4 text-primary shrink-0" /> 
                  {project.rodovia} • KM {project.kmInicial} ao {project.kmFinal} ({project.lado})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10 flex-1 flex flex-col">
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                    <span>Progresso Técnico</span>
                    <span className="text-white">65%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,107,0,0.3)]" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Criado em</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-primary" />
                      {format(project.dataCriacao, 'dd MMM yy')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Faturamento</span>
                    <span className="text-xs font-bold text-green-500">R$ 420.000</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 mt-auto">
                  <Button variant="outline" size="lg" className="glass-card h-12 border-white/10 hover:border-primary/50 text-[10px] font-black uppercase tracking-[0.2em] group/btn transition-all" asChild>
                    <Link to="/ai-assistant">
                      Analisar IA
                      <ChevronRight className="h-3 w-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" className="h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all" asChild>
                    <Link to="/measurements">Medições</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

