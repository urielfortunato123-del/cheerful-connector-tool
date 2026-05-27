import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents, ScaleControl, Tooltip } from "react-leaflet";
import L from "leaflet";
import { MapFeature } from "@/lib/db";
import { GISTool } from "./GISToolbar";
import { calculateSpatialMetrics } from "@/lib/gis-utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BaseLayer, EngineeringLayer } from "./GISContainer";
import { Navigation, Info, Mountain, Waves } from "lucide-react";

// Fix for default marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GISMapProps {
  activeTool: GISTool;
  features: MapFeature[];
  onFeatureCreate: (feature: Partial<MapFeature>) => void;
  selectedFeatureId: number | null;
  onSelectFeature: (id: number | null) => void;
  activeBaseLayer: BaseLayer;
  activeEngineeringLayers: Set<EngineeringLayer>;
  isGpsActive: boolean;
  gpsMode: string;
}

function MapEvents({ activeTool, onPointAdd, onComplete }: { 
  activeTool: GISTool, 
  onPointAdd: (latlng: L.LatLng) => void,
  onComplete: () => void
}) {
  useMapEvents({
    click(e) {
      if (activeTool !== 'select') {
        onPointAdd(e.latlng);
      }
    },
    keydown(e) {
      if (e.originalEvent.key === 'Enter') {
        onComplete();
      }
    }
  });
  return null;
}

function GpsTracker({ active, mode }: { active: boolean, mode: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMapEvents({
    locationfound(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      if (active) {
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  useEffect(() => {
    if (active) {
      map.locate({ 
        watch: true, 
        enableHighAccuracy: mode === 'high_precision' || mode === 'engineering' 
      });
    } else {
      map.stopLocate();
      setPosition(null);
    }
  }, [active, mode, map]);

  if (!position) return null;

  return (
    <Marker position={position} icon={new L.DivIcon({
      className: 'gps-pulse',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
          <div class="absolute w-8 h-8 bg-primary/40 rounded-full animate-pulse"></div>
          <div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    })}>
      <Popup className="rounded-2xl">
        <div className="p-2 font-sans">
          <div className="text-[10px] font-black uppercase text-primary mb-1 flex items-center gap-1">
            <Navigation className="h-3 w-3" /> GPS ATIVO
          </div>
          <div className="text-[11px] font-bold">Modo: {mode}</div>
          <div className="text-[9px] text-muted-foreground mt-1">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function GISMap({ 
  activeTool, 
  features, 
  onFeatureCreate,
  selectedFeatureId,
  onSelectFeature,
  activeBaseLayer,
  activeEngineeringLayers,
  isGpsActive,
  gpsMode
}: GISMapProps) {
  const [activePoints, setActivePoints] = useState<[number, number][]>([]);
  const center: [number, number] = [-23.5505, -46.6333];

  const handlePointAdd = (latlng: L.LatLng) => {
    if (activeTool === 'marker') {
      const newFeature: Partial<MapFeature> = {
        type: 'point',
        category: 'geral',
        name: `Ponto ${new Date().toLocaleTimeString()}`,
        coordinates: [latlng.lat, latlng.lng],
        properties: { description: 'Marcador manual' }
      };
      onFeatureCreate(newFeature);
      return;
    }
    
    setActivePoints(prev => [...prev, [latlng.lat, latlng.lng]]);
  };

  const handleComplete = useCallback(() => {
    if (activePoints.length < 2) return;

    const type = activeTool === 'measure_dist' || activeTool === 'draw_line' ? 'line' : 'area';
    const metrics = calculateSpatialMetrics(type, activePoints);

    const newFeature: Partial<MapFeature> = {
      type,
      category: 'geral',
      name: `${type === 'line' ? 'Trecho' : 'Área'} ${new Date().toLocaleTimeString()}`,
      coordinates: activePoints,
      properties: {
        ...metrics,
        description: 'Capturado via GIS Operacional'
      }
    };

    onFeatureCreate(newFeature);
    setActivePoints([]);
  }, [activePoints, activeTool, onFeatureCreate]);

  const baseLayerUrl = useMemo(() => {
    switch(activeBaseLayer) {
      case 'satellite': return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case 'topography': return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      case 'streets': return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      case 'dark': 
      default: return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
  }, [activeBaseLayer]);

  const [mousePos, setMousePos] = useState<[number, number] | null>(null);

  function MouseTracker() {
    useMapEvents({
      mousemove(e) {
        setMousePos([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  }

  return (
    <div className="w-full h-full relative group/map overflow-hidden">
      {/* Compass / Bússola */}
      <div className="absolute top-4 left-4 z-[1000] w-12 h-12 bg-background/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-xl">
        <Navigation className="h-6 w-6 text-primary transition-transform duration-300" style={{ transform: 'rotate(-45deg)' }} />
        <div className="absolute -top-1 text-[8px] font-black text-primary">N</div>
      </div>

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        doubleClickZoom={false}
      >
        <TileLayer url={baseLayerUrl} />
        <MouseTracker />
        
        {/* Engineering Overlays (Functional Toggles) */}
        {activeEngineeringLayers.has('hidrografia') && (
          <TileLayer 
            url="https://tile.waymarkedtrails.org/waterway/{z}/{x}/{y}.png"
            opacity={0.6}
            zIndex={10}
          />
        )}

        {activeEngineeringLayers.has('curvas_nivel') && (
          <TileLayer 
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            opacity={0.4}
            zIndex={5}
          />
        )}

        <MapEvents 
          activeTool={activeTool} 
          onPointAdd={handlePointAdd}
          onComplete={handleComplete}
        />

        <GpsTracker active={isGpsActive} mode={gpsMode} />

        <ScaleControl position="bottomright" />

        {/* Render Saved Features */}
        {features.map((f) => {
          // Filter by active categories if applicable
          if (!activeEngineeringLayers.has(f.category as any) && f.category !== 'geral') return null;

          const isSelected = selectedFeatureId === f.id;
          const color = isSelected ? "#3b82f6" : (f.properties.color || (f.category === 'drenagem' ? "#3b82f6" : f.category === 'obras' ? "#f97316" : "#FF6B00"));
          
          if (f.type === 'line') {
            return (
              <Polyline 
                key={f.id} 
                positions={f.coordinates} 
                color={color} 
                weight={isSelected ? 6 : 4}
                eventHandlers={{ click: () => onSelectFeature(f.id!) }}
              >
                <Tooltip sticky>
                  <div className="p-3 font-sans bg-background/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl min-w-[160px]">
                    <div className="text-[10px] font-black uppercase text-primary mb-2 flex items-center justify-between">
                      {f.name}
                      <Info className="h-3 w-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white/5 rounded-xl">
                        <div className="text-[8px] uppercase text-muted-foreground font-bold">Extensão</div>
                        <div className="text-xs font-black">{f.properties.distance} km</div>
                      </div>
                      <div className="p-2 bg-white/5 rounded-xl">
                        <div className="text-[8px] uppercase text-muted-foreground font-bold">Categoria</div>
                        <div className="text-xs font-black capitalize">{f.category}</div>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          } else if (f.type === 'area') {
            return (
              <Polygon 
                key={f.id} 
                positions={f.coordinates} 
                color={color}
                fillColor={color}
                fillOpacity={0.2}
                weight={isSelected ? 3 : 2}
                eventHandlers={{ click: () => onSelectFeature(f.id!) }}
              >
                <Tooltip sticky>
                  <div className="p-3 font-sans bg-background/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl min-w-[160px]">
                    <div className="text-[10px] font-black uppercase text-primary mb-2 flex items-center justify-between">
                      {f.name}
                      <Info className="h-3 w-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white/5 rounded-xl">
                        <div className="text-[8px] uppercase text-muted-foreground font-bold">Área</div>
                        <div className="text-xs font-black">{f.properties.area} km²</div>
                      </div>
                      <div className="p-2 bg-white/5 rounded-xl">
                        <div className="text-[8px] uppercase text-muted-foreground font-bold">Perímetro</div>
                        <div className="text-xs font-black">{f.properties.distance} km</div>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </Polygon>
            );
          } else {
            return (
              <Marker 
                key={f.id} 
                position={f.coordinates}
                eventHandlers={{ click: () => onSelectFeature(f.id!) }}
              >
                <Popup className="rounded-2xl">
                  <div className="font-sans p-2">
                    <h4 className="font-black text-xs uppercase tracking-tighter mb-1">{f.name}</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">{f.properties.description}</p>
                    <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                       <Button size="sm" className="h-6 text-[9px] font-bold uppercase rounded-lg">Ver Detalhes</Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
        })}

        {/* Render Active Drawing */}
        {activePoints.length > 0 && (
          <>
            {activePoints.map((p, i) => (
              <Marker key={`active-${i}`} position={p as [number, number]} icon={new L.DivIcon({
                className: 'drawing-dot',
                html: `<div class="w-3 h-3 bg-white border-2 border-primary rounded-full shadow-lg"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })} />
            ))}
            {activePoints.length > 1 && (
              <Polyline 
                positions={activePoints} 
                color="#3b82f6" 
                dashArray="10, 10" 
                weight={3}
              />
            )}
            {activeTool.includes('area') && activePoints.length > 2 && (
              <Polygon 
                positions={[...activePoints, activePoints[0]] as [number, number][]} 
                color="#3b82f6" 
                fillOpacity={0.1}
                weight={1}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Floating Indicators */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {activeEngineeringLayers.has('hidrografia') && (
          <div className="bg-background/80 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center gap-2 text-[9px] font-bold uppercase animate-in slide-in-from-right-5">
            <Waves className="h-3 w-3 text-cyan-500" /> Hidrografia Ativa
          </div>
        )}
        {activeEngineeringLayers.has('curvas_nivel') && (
          <div className="bg-background/80 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center gap-2 text-[9px] font-bold uppercase animate-in slide-in-from-right-5">
            <Mountain className="h-3 w-3 text-emerald-500" /> Topografia Ativa
          </div>
        )}
      </div>

      {/* Floating Metrics Card during drawing */}
      {activePoints.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-background/80 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10">
           <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Pontos Capturados</span>
              <span className="text-lg font-black">{activePoints.length}</span>
           </div>
           <div className="flex flex-col border-l border-white/5 pl-8">
              <span className="text-[9px] font-black uppercase text-primary">Medição Estimada</span>
              <span className="text-lg font-black text-primary">
                {activeTool.includes('area') 
                  ? `${calculateSpatialMetrics('area', activePoints).area} km²`
                  : `${calculateSpatialMetrics('line', activePoints).distance} km`
                }
              </span>
      </div>

      {/* Mini Map Placeholder */}
      <div className="absolute bottom-4 right-16 z-[1000] w-32 h-32 rounded-3xl border-4 border-background/80 shadow-2xl overflow-hidden bg-muted group/mini hover:scale-110 transition-transform">
        <div className="w-full h-full opacity-50 bg-[url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/374/617')] bg-cover"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
        </div>
        <div className="absolute bottom-1 left-0 right-0 text-center text-[7px] font-black uppercase text-white/50 tracking-tighter">Mini-Map V1</div>
      </div>
           <Button 
            size="sm" 
            className="rounded-2xl font-black uppercase text-[10px] ml-4 h-12 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
            onClick={handleComplete}
           >
            Finalizar Geometria (Enter)
           </Button>
        </div>
      )}

      {/* Real-time coordinates display */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1">
        {mousePos && (
          <div className="bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-primary flex gap-3 shadow-2xl animate-in fade-in slide-in-from-left-2">
            <span>LAT: {mousePos[0].toFixed(6)}</span>
            <span className="text-white/20">|</span>
            <span>LNG: {mousePos[1].toFixed(6)}</span>
          </div>
        )}
        <div className="bg-background/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest pointer-events-none w-fit">
          InfraFlow GIS Engine v5.2 | PRO-MODE
        </div>
      </div>
    </div>
  );
}
