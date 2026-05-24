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
} from "lucide-react";
import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";

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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <HardHat className="h-6 w-6 text-primary-foreground" />
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
                className="transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                className="transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
              <h1 className="text-lg font-semibold tracking-tight">Sistema de Infraestrutura Rodoviária</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="hidden sm:inline-block">Status: Operacional</span>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
