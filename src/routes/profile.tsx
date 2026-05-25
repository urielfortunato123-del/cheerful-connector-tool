import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  HardHat, 
  ShieldCheck, 
  Mail, 
  Briefcase, 
  IdCard, 
  Save,
  Camera,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const [user, setUser] = useState({
    nome: "Eng. Ricardo Oliveira",
    email: "ricardo.der@sp.gov.br",
    cargo: "Engenheiro de Obras Pleno",
    crea: "506.123.456-SP",
    orgao: "DER-SP",
    bio: "Especialista em pavimentação asfáltica e drenagem profunda."
  });

  useEffect(() => {
    const saved = localStorage.getItem('infraflow_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem('infraflow_user', JSON.stringify(user));
    toast.success("Perfil atualizado localmente.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/20 border rounded-2xl">
        <div className="relative group">
          <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 overflow-hidden">
            <User className="h-12 w-12 text-primary-foreground" />
          </div>
          <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
            <Camera className="h-6 w-6 text-white" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{user.nome}</h1>
          <p className="text-muted-foreground">{user.cargo} • {user.orgao}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
              <ShieldCheck className="h-3 w-3" /> CREA Ativo
            </Badge>
            <Badge variant="outline" className="gap-1">
              Engenharia Rodoviária
            </Badge>
          </div>
        </div>
        <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-2">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
            <CardDescription>Dados utilizados em memoriais e relatórios automáticos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={user.nome} onChange={e => setUser({...user, nome: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>E-mail Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo / Função</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={user.cargo} onChange={e => setUser({...user, cargo: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Registro CREA</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={user.crea} onChange={e => setUser({...user, crea: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <Button className="w-full gap-2" onClick={handleSave}>
                <Save className="h-4 w-4" /> Atualizar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Assinatura Digital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="aspect-video rounded border-2 border-dashed border-border/50 flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-[10px] text-muted-foreground italic mb-2">Sua assinatura aparecerá em relatórios e memoriais.</p>
                  <Button variant="outline" size="sm">Configurar Assinatura</Button>
               </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold flex items-center gap-2 text-primary">
              <HardHat className="h-4 w-4" />
              Certificação Local
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Os dados de perfil são usados para preencher automaticamente o rodapé de projetos e memoriais gerados pelo sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
