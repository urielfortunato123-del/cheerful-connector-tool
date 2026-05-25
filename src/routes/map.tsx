import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Layers, Ruler, Navigation, Factory, Truck, MousePointer2 } from "lucide-react";
import { db, Project } from "@/lib/db";
import { toast } from "sonner";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const Route = createFileRoute("/map")({
  component: RoadMap,
});

function MapEvents({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

function RoadMap() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [markers, setMarkers] = useState<[number, number][]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [center] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const all = await db.projects.toArray();
    setProjects(all);
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isMeasuring) {
      setMarkers(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      toast.info(`Coordenada marcada: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    }
  };

  const calculateDistance = () => {
    if (markers.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < markers.length - 1; i++) {
      const p1 = L.latLng(markers[i]);
      const p2 = L.latLng(markers[i+1]);
      total += p1.distanceTo(p2);
    }
    return (total / 1000).toFixed(2);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            InfraMap GIS
          </h1>
          <p className="text-xs text-muted-foreground">Monitoramento geoespacial de obras e rodovias</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isMeasuring ? "default" : "outline"} 
            size="sm" 
            className="gap-2"
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              if (!isMeasuring) setMarkers([]);
            }}
          >
            <Ruler className="h-4 w-4" /> {isMeasuring ? "Parar Medição" : "Medir Trecho"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2"><Layers className="h-4 w-4" /> Camadas</Button>
        </div>
      </div>

      <div className="relative flex-1 rounded-2xl overflow-hidden border border-border shadow-2xl bg-muted/20">
        <MapContainer 
          center={center} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MapEvents onMapClick={handleMapClick} />

          {/* Markers from current measurement */}
          {markers.map((pos, i) => (
            <Marker key={i} position={pos}>
              <Popup>Ponto {i + 1}</Popup>
            </Marker>
          ))}

          {markers.length > 1 && (
            <Polyline positions={markers} color="#FF6B00" weight={4} dashArray="10, 10" />
          )}

          {/* Project markers (Mocked locations based on KM for now) */}
          {projects.map((p) => (
            <Marker 
              key={p.id} 
              position={[-23.5505 + (p.id || 0) * 0.01, -46.6333 + (p.id || 0) * 0.01]}
              icon={new L.DivIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #FF6B00; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #FF6B00;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm">{p.nome}</h3>
                  <p className="text-[10px] text-muted-foreground">{p.rodovia} • KM {p.kmInicial}</p>
                  <Button variant="link" size="sm" className="h-6 p-0 text-primary">Ver Projeto</Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Info Card */}
        {isMeasuring && markers.length > 0 && (
          <div className="absolute bottom-6 right-6 z-[1000] glass-card p-4 rounded-xl border border-primary/30 w-64 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Painel de Medição</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Pontos marcados:</span>
                <span className="text-sm font-bold">{markers.length}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/50 pt-2">
                <span className="text-xs text-muted-foreground">Distância Total:</span>
                <span className="text-lg font-black text-primary">{calculateDistance()} km</span>
              </div>
              <Button size="sm" variant="secondary" className="w-full text-[10px] h-7 font-bold uppercase" onClick={() => setMarkers([])}>Limpar Trecho</Button>
            </div>
          </div>
        )}

        {/* Overlay Tools */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <Card className="glass-card border-border/50">
            <CardContent className="p-2 flex flex-col gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Ponte"><Factory className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Tráfego"><Truck className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Seleção"><MousePointer2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
