import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, LayersControl } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { db, Project, Measurement, DailyLog } from "@/lib/db";
import { toast } from "sonner";
import { FileText, Camera, Map as MapIcon, Crosshair } from "lucide-react";
import { format } from "date-fns";

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
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [markers, setMarkers] = useState<[number, number][]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const center: [number, number] = [-23.5505, -46.6333];

  useEffect(() => {
    const loadData = async () => {
      const [projData, measData, logsData] = await Promise.all([
        db.projects.toArray(),
        db.measurements.toArray(),
        db.dailyLogs.toArray()
      ]);
      setProjects(projData);
      setMeasurements(measData);
      setDailyLogs(logsData);
    };
    loadData();
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
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <Button
          variant={isMeasuring ? "default" : "secondary"}
          size="sm"
          className="shadow-xl"
          onClick={() => { setIsMeasuring(!isMeasuring); if (!isMeasuring) setMarkers([]); }}
        >
          <Crosshair className="h-4 w-4 mr-2" />
          {isMeasuring ? "Finalizar Medição" : "Medir Trecho"}
        </Button>
      </div>

      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} className="z-0">
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Modo Noturno (Foco)">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satélite (Campo)">
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <MapEvents onMapClick={handleMapClick} />

        {markers.map((pos, i) => (
          <Marker key={i} position={pos}><Popup>Vértice {i + 1}</Popup></Marker>
        ))}
        {markers.length > 1 && <Polyline positions={markers} color="#FF6B00" weight={5} dashArray="10, 15" />}

        {/* Projetos Ativos */}
        {projects.map((p) => (
          <Marker
            key={`proj-${p.id}`}
            position={[-23.5505 + (p.id || 0) * 0.02, -46.6333 + (p.id || 0) * 0.02]}
            icon={new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #FF6B00; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(255,107,0,0.5);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })}
          >
            <Popup className="professional-popup">
              <div className="p-2 min-w-[150px]">
                <h4 className="font-black text-[10px] uppercase text-primary tracking-tighter mb-1">PROJETO ATIVO</h4>
                <h3 className="font-bold text-sm leading-tight mb-1">{p.nome}</h3>
                <div className="flex flex-col gap-1 text-[10px] text-muted-foreground border-t border-border mt-2 pt-2">
                  <span>Rodovia: {p.rodovia}</span>
                  <span>Extensão: KM {p.kmInicial} ao {p.kmFinal}</span>
                  <span className={`mt-1 font-bold ${p.status === 'Em Execução' ? 'text-green-500' : 'text-orange-500'}`}>{p.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Medições e Registros */}
        {measurements.map((m, idx) => (
          <Marker
            key={`meas-${idx}`}
            position={[-23.5505 + (m.projectId || 0) * 0.02 + 0.005, -46.6333 + (m.projectId || 0) * 0.02 + 0.005]}
            icon={new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #3b82f6; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>`,
              iconSize: [8, 8],
              iconAnchor: [4, 4]
            })}
          >
            <Popup>
              <div className="p-1">
                <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 mb-1">
                  <FileText className="h-3 w-3" /> MEDIÇÃO TÉCNICA
                </div>
                <p className="font-bold text-xs">{m.tipoServico}</p>
                <p className="text-[10px] text-muted-foreground">{m.quantidade} {m.unidade}</p>
                <p className="text-[9px] mt-1 opacity-60">{format(m.data, 'dd/MM/yyyy')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isMeasuring && markers.length > 0 && (
        <div className="absolute bottom-6 right-6 z-[1000] glass-card p-5 rounded-2xl border border-primary/40 w-72 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h4 className="text-[10px] font-black uppercase tracking-tighter text-primary">Engenharia de Precisão</h4>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase">Vértices</span>
                <span className="text-xl font-black">{markers.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase">Extensão</span>
                <span className="text-xl font-black text-primary">{calculateDistance()} km</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button size="sm" variant="outline" className="flex-1 text-[10px] h-8" onClick={() => setMarkers([])}>Reiniciar</Button>
              <Button size="sm" className="flex-1 text-[10px] h-8 shadow-lg shadow-primary/20">Salvar Trecho</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
