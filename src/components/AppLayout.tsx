import {
  LayoutDashboard,
  Bot,
  Calculator,
  FolderKanban,
  FileCheck,
  FileText,
  Library,
  Ruler,
  BookOpen,
  BarChart3,
  Map as MapIcon,
  Settings,
  User,
  HardHat,
  Save,
  Download,
  XCircle,
  Briefcase,
  Moon,
  Sun
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

import { Link, useLocation } from "@tanstack/react-router";
import { WorkspaceService } from "@/services/WorkspaceService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Assistente Técnico IA", icon: Bot, path: "/ai-assistant" },
  { title: "Biblioteca Inteligente", icon: Library, path: "/library" },
  { title: "Orçamentos", icon: Calculator, path: "/budgets" },
  { title: "Projetos", icon: FolderKanban, path: "/projects" },
  { title: "As-Built", icon: FileCheck, path: "/as-built" },
  { title: "Memorial Descritivo", icon: FileText, path: "/memorial" },
  { title: "Normas Técnicas", icon: BookOpen, path: "/standards" },
  { title: "Medições", icon: Ruler, path: "/measurements" },
  { title: "Diário de Obra", icon: BookOpen, path: "/daily-log" },
  { title: "Financeiro", icon: BarChart3, path: "/financial" },
  { title: "Mapa da Rodovia", icon: MapIcon, path: "/map" },
];

const footerItems = [
  { title: "Configurações", icon: Settings, path: "/settings" },
  { title: "Perfil", icon: User, path: "/profile" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar/50 backdrop-blur-xl sidebar-glow" collapsible="icon">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-primary/10 p-2 orange-glow">
            <img 
              src="/logo.png?v=2" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarMenu className="gap-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.path}
                tooltip={item.title}
                className={cn(
                  "h-10 transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                  location.pathname === item.path && "bg-primary/15 text-primary font-bold shadow-[0_0_15px_rgba(255,107,0,0.1)]"
                )}
              >
                <Link to={item.path} className="flex items-center gap-3" aria-label={`Ir para ${item.title}`}>

                  <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <div className="flex flex-col gap-1">
          {footerItems.map((item) => (
            <SidebarMenuButton
              key={item.title}
              asChild
              tooltip={item.title}
              className={cn(
                "h-10 transition-all hover:bg-primary/10",
                location.pathname === item.path && "bg-primary/15 text-primary"
              )}
            >
              <Link to={item.path} className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          ))}
          
          <SidebarMenuButton
            onClick={() => {
              const event = new CustomEvent('trigger-pwa-install');
              window.dispatchEvent(event);
              toast.info("Iniciando instalação...");
            }}
            className="h-10 transition-all hover:bg-primary/10 text-muted-foreground hover:text-primary mt-1"
            tooltip="Instalar Aplicativo"
          >
            <div className="flex items-center gap-3 w-full">
              <Download className="h-5 w-5" />
              <span className="text-sm">Instalar App</span>
            </div>
          </SidebarMenuButton>

          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
              UF
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-bold text-white truncate">Uriel Fortunato</p>
              <p className="text-[9px] text-muted-foreground truncate uppercase tracking-tighter">Engenheiro Sênior</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}



const ThemeToggle = () => {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("infraflow_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("infraflow_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary transition-colors"
      aria-label="Alternar Tema"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground bg-dot-pattern">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border/40 bg-background/40 px-6 backdrop-blur-xl">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-primary transition-colors" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 px-4">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
                      <span className="font-black text-sm tracking-tight text-white uppercase">
                        {WorkspaceService.getCurrentProject()?.name || "Projeto Ativo"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 glass-card p-2 border-primary/20">
                    <DropdownMenuItem className="gap-3 cursor-pointer p-3 rounded-lg hover:bg-primary/10 transition-colors" onClick={() => WorkspaceService.saveProject()}>
                      <Save className="h-4 w-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-wider">Salvar Projeto</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 cursor-pointer p-3 rounded-lg hover:bg-primary/10 transition-colors" onClick={() => WorkspaceService.exportBackup()}>
                      <Download className="h-4 w-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-wider">Exportar Backup</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="gap-3 cursor-pointer p-3 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => WorkspaceService.closeProject()}>
                      <XCircle className="h-4 w-4" />
                      <span className="font-bold text-xs uppercase tracking-wider">Fechar Workspace</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 shadow-[0_0_15px_rgba(255,107,0,0.05)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Engenharia Rodoviária</span>
                </div>
                <ThemeToggle />
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                  <User className="h-4 w-4" />
                </div>
              </div>

            </div>
          </header>
          <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">{children}</div>
          <footer className="mt-auto border-t border-border/40 bg-sidebar/30 py-6 px-8 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                © 2026 INFRAFLOW • SISTEMA DE GESTÃO RODOVIÁRIA V2.4
              </p>
              <p className="text-xs text-muted-foreground/80">
                Desenvolvido por <span className="inline-block font-black text-primary hover:text-primary/80 transition-colors cursor-pointer tracking-tighter">Uriel da Fonseca Fortunato</span>
              </p>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}

