import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Layers, Ruler, Navigation, Factory, Truck } from "lucide-react";

export const Route = createFileRoute("/map")({
  component: RoadMap,
});

function RoadMap() {
  return (
    <div className="space-y-4 h-[calc(100vh-10rem)]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mapa da Rodovia (GIS)</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Layers className="h-4 w-4" /> Camadas</Button>
          <Button variant="outline" size="sm" className="gap-2"><Ruler className="h-4 w-4" /> Medir</Button>
        </div>
      </div>

      <div className="relative h-full w-full rounded-2xl overflow-hidden border border-border bg-[#0a0a0a] orange-glow">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-46.6333,-23.5505,10,0/1200x800?access_token=pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHU0...') ] bg-cover opacity-40 grayscale" />
        
        {/* Animated road lines effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full opacity-20">
             <path d="M0,500 Q250,450 500,500 T1000,500" stroke="#FF6B00" strokeWidth="4" fill="transparent" strokeDasharray="10 5" />
             <path d="M0,520 Q250,470 500,520 T1000,520" stroke="#0066CC" strokeWidth="4" fill="transparent" strokeDasharray="10 5" />
          </svg>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="glass-card"><Navigation className="h-4 w-4" /></Button>
          <Button size="icon" variant="secondary" className="glass-card"><Factory className="h-4 w-4" /></Button>
          <Button size="icon" variant="secondary" className="glass-card"><Truck className="h-4 w-4" /></Button>
        </div>

        {/* Mock Markers */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 group">
          <div className="relative">
            <MapPin className="h-8 w-8 text-primary animate-bounce" />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Obra SP-300: KM 124
            </div>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 glass-card p-4 rounded-xl border border-border/50 max-w-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Legenda Técnica</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Obras de Pavimentação</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Drenagem Executada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
