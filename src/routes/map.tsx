import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Navigation, Loader2 } from "lucide-react";

const MapView = lazy(() => import("@/components/MapView"));

export const Route = createFileRoute("/map")({
  component: RoadMap,
  ssr: false,
});

function RoadMap() {
  return (
    <div className="space-y-4 h-[calc(100vh-10rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Navigation className="h-6 w-6 text-primary" />
          InfraMap GIS
        </h1>
        <p className="text-xs text-muted-foreground">Monitoramento geoespacial de obras e rodovias</p>
      </div>

      <ClientOnly fallback={
        <div className="flex-1 rounded-2xl border border-border bg-muted/20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <Suspense fallback={
          <div className="flex-1 rounded-2xl border border-border bg-muted/20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <MapView />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
