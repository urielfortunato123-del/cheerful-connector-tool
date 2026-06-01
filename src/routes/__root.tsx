import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ReactQueryDevtools removed to avoid dependency issue
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useHydrated,
  HeadContent,
  Scripts,
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
            Voltar ao Dashboard
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
      { title: "InfraFlow — Gestão de Infraestrutura" },
      { name: "description", content: "Plataforma premium de engenharia de infraestrutura rodoviária." },
      { name: "author", content: "InfraFlow" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "InfraFlow" },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "msapplication-TileColor", content: "#0ea5e9" },
      { name: "theme-color", content: "#0ea5e9" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
        crossOrigin: ""
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
      },
      // iOS Splash Screens
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
        href: "/apple-splash-1290-2796.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
        href: "/apple-splash-1179-2556.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
        href: "/apple-splash-1284-2778.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
        href: "/apple-splash-1170-2532.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
        href: "/apple-splash-1125-2436.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
        href: "/apple-splash-828-1792.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
        href: "/apple-splash-2048-2732.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
        href: "/apple-splash-1668-2388.png"
      },
      {
        rel: "apple-touch-startup-image",
        media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
        href: "/apple-splash-1536-2048.png"
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
    <html lang="pt-BR" className="dark">
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
  const [workspaceActive, setWorkspaceActive] = React.useState(
    typeof window !== 'undefined' ? !!WorkspaceService.getCurrentProject() : false
  );

  React.useEffect(() => {
    if (!hydrated) return;

    // Check if there is an active project on load
    const activeProject = WorkspaceService.getCurrentProject();
    if (activeProject) {
      setWorkspaceActive(true);
    }

    const handleProjectChange = () => {
      console.log('Project change detected, activating workspace');
      setWorkspaceActive(true);
    };

    window.addEventListener('infraflow_project_changed', handleProjectChange);
    // Also listen for storage changes in case of multi-tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'infraflow_active_project' && e.newValue) {
        setWorkspaceActive(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('infraflow_project_changed', handleProjectChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [hydrated]);

  if (!hydrated) return null;

  // For visual consistency, we wrap the landing page in a similar background
  const landingPage = (
    <div className="fixed inset-0 z-[100] bg-background overflow-auto bg-dot-pattern">
      <WorkspaceLanding />
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PWAInstallPrompt />
      {!workspaceActive ? (
        landingPage
      ) : (
        <AppLayout>
          <Outlet />
        </AppLayout>
      )}
      <Toaster position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}


