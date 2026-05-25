import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  FolderOpen
} from "lucide-react";
import { db, Project } from "@/lib/db";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/projects")({
  component: Projects,
});

function Projects() {
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
    const allProjects = await db.projects.toArray();
    setProjects(allProjects);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HardHat className="h-8 w-8 text-primary" />
            Gestão de Projetos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas obras e estudos rodoviários</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-card">
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
              <DialogDescription>Insira os dados técnicos da rodovia e trecho.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Projeto / Objeto</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Duplicação SP-300" 
                  value={newProject.nome}
                  onChange={e => setNewProject({...newProject, nome: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rodovia">Rodovia</Label>
                  <Input 
                    id="rodovia" 
                    placeholder="Ex: SP-300" 
                    value={newProject.rodovia}
                    onChange={e => setNewProject({...newProject, rodovia: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lado">Lado / Pista</Label>
                  <Select 
                    value={newProject.lado} 
                    onValueChange={(v: any) => setNewProject({...newProject, lado: v})}
                  >
                    <SelectTrigger>
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
                <div className="grid gap-2">
                  <Label htmlFor="kmInit">KM Inicial</Label>
                  <Input 
                    id="kmInit" 
                    type="number" 
                    value={newProject.kmInicial}
                    onChange={e => setNewProject({...newProject, kmInicial: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kmFinal">KM Final</Label>
                  <Input 
                    id="kmFinal" 
                    type="number" 
                    value={newProject.kmFinal}
                    onChange={e => setNewProject({...newProject, kmFinal: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateProject}>Salvar Projeto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border/50">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Pesquisar projetos por nome ou rodovia..." 
          className="border-none bg-transparent focus-visible:ring-0"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum projeto encontrado.</p>
          <Button variant="link" onClick={() => setIsDialogOpen(true)} className="text-primary mt-2">
            Clique aqui para criar o primeiro
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="glass-card hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteProject(project.id!)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    project.status === 'Em Execução' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    project.status === 'Em Planejamento' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {project.status}
                  </div>
                </div>
                <CardTitle className="text-xl mt-2 line-clamp-1">{project.nome}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {project.rodovia} • KM {project.kmInicial} ao {project.kmFinal} ({project.lado})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(project.dataCriacao, 'dd/MM/yyyy')}</span>
                    <span className="font-bold text-primary">ID: #{project.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full text-[11px] h-8 uppercase font-bold tracking-wider">
                      Detalhes
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full text-[11px] h-8 uppercase font-bold tracking-wider">
                      Gerenciar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
