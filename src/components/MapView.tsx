import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { db, Project } from "@/lib/db";
import { toast } from "sonner";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapEvents({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({ click: onMapClick });
  return null;
}

export default function MapView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [markers, setMarkers] = useState<[number, number][]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const center: [number, number] = [-23.5505, -46.6333];

  useEffect(() => {
    db.projects.toArray().then(setProjects);
  }, []);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isMeasuring) {
      setMarkers(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      toast.info(`Coordenada: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    }
  };

  const calculateDistance = () => {
    if (markers.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < markers.length - 1; i++) {
      total += L.latLng(markers[i]).distanceTo(L.latLng(markers[i+1]));
    }
    return (total / 1000).toFixed(2);
  };

  return (
    <div className="relative flex-1 rounded-2xl overflow-hidden border border-border shadow-2xl bg-muted/20 h-full">
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          variant={isMeasuring ? "default" : "outline"}
          size="sm"
          onClick={() => { setIsMeasuring(!isMeasuring); if (!isMeasuring) setMarkers([]); }}
        >
          {isMeasuring ? "Parar Medição" : "Medir Trecho"}
        </Button>
      </div>

      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} className="z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onMapClick={handleMapClick} />

        {markers.map((pos, i) => (
          <Marker key={i} position={pos}><Popup>Ponto {i + 1}</Popup></Marker>
        ))}
        {markers.length > 1 && <Polyline positions={markers} color="#FF6B00" weight={4} dashArray="10, 10" />}

        {projects.map((p) => (
          <Marker
            key={p.id}
            position={[-23.5505 + (p.id || 0) * 0.01, -46.6333 + (p.id || 0) * 0.01]}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{p.nome}</h3>
                <p className="text-[10px]">{p.rodovia} • KM {p.kmInicial}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isMeasuring && markers.length > 0 && (
        <div className="absolute bottom-6 right-6 z-[1000] glass-card p-4 rounded-xl border border-primary/30 w-64">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Painel de Medição</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Pontos:</span><span className="font-bold">{markers.length}</span></div>
            <div className="flex justify-between border-t border-border/50 pt-2"><span className="text-xs text-muted-foreground">Distância:</span><span className="text-lg font-black text-primary">{calculateDistance()} km</span></div>
            <Button size="sm" variant="secondary" className="w-full" onClick={() => setMarkers([])}>Limpar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
