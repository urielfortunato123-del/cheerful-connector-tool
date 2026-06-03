import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useHydrated,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Toaster } from "@/components/ui/sonner";
import { WorkspaceService } from "@/services/WorkspaceService";
import { WorkspaceLanding } from "@/components/workspace/WorkspaceLanding";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Erro ao carregar página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente atualizar ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Acqua Soft Atendimento" },
      { name: "description", content: "Solicitações de atendimento Acqua Soft Purificadores." },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Acqua Soft" },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "theme-color", content: "#003366" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/pwa-192x192.png"
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "manifest",
        href: "/manifest.webmanifest"
      }
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const hydrated = useHydrated();
  const location = useLocation();

  if (!hydrated) return null;

  // New routes for Acqua Soft bypass the old workspace logic
  const isAcquaSoftRoute = ['/', '/atendimento', '/admin'].includes(location.pathname);

  if (isAcquaSoftRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <PWAInstallPrompt />
        <Outlet />
        <Toaster position="top-right" />
      </QueryClientProvider>
    );
  }

  // Fallback for old engineering routes
  return (
    <QueryClientProvider client={queryClient}>
      <PWAInstallPrompt />
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}
