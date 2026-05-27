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
  Briefcase
} from "lucide-react";
import * as React from "react";
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
    <Sidebar className="border-r border-border bg-sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 overflow-hidden shadow-sm">
            <img 
              src="https://res.cloudinary.com/dcii6r5op/image/upload/v1779890945/promaxx/hg1u4zvxghgnzleyp5hd.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Infra<span className="text-primary">Flow</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.path}
                tooltip={item.title}
                className="transition-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Link to={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="transition-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Link to={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
          <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
            <SidebarTrigger className="mr-4" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-bold tracking-tight text-primary">
                        {WorkspaceService.getCurrentProject()?.name || "Projeto Ativo"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 glass-card">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => WorkspaceService.saveProject()}>
                      <Save className="h-4 w-4" />
                      Salvar Projeto
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => WorkspaceService.exportBackup()}>
                      <Download className="h-4 w-4" />
                      Exportar Backup (.zip)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 cursor-pointer text-red-500 hover:text-red-600" onClick={() => WorkspaceService.closeProject()}>
                      <XCircle className="h-4 w-4" />
                      Fechar Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Briefcase className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Engenharia Rodoviária</span>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 p-6">{children}</div>
          <footer className="mt-auto border-t border-border bg-sidebar/50 py-4 px-6 text-center">
            <p className="text-xs text-muted-foreground">
              Desenvolvido por <span className="inline-block animate-pulse font-medium text-primary">Uriel da Fonseca Fortunato</span>
            </p>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
