import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents, LayersControl, ScaleControl } from "react-leaflet";
import L from "leaflet";
import { MapFeature, Project, db } from "@/lib/db";
import { GISTool } from "./GISToolbar";
import { calculateSpatialMetrics } from "@/lib/gis-utils";
import { toast } from "sonner";
import { Tooltip } from "react-leaflet";

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

export default function GISMap({ 
  activeTool, 
  features, 
  onFeatureCreate,
  selectedFeatureId,
  onSelectFeature
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

  // Snap logic simulation or custom handlers could go here

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        doubleClickZoom={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Modo Noturno (GIS)">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satélite HD">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topografia (OpenTopo)">
            <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapEvents 
          activeTool={activeTool} 
          onPointAdd={handlePointAdd}
          onComplete={handleComplete}
        />

        <ScaleControl position="bottomright" />

        {/* Render Saved Features */}
        {features.map((f) => {
          const isSelected = selectedFeatureId === f.id;
          const color = isSelected ? "#3b82f6" : (f.properties.color || "#FF6B00");
          
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
                  <div className="p-2 font-sans">
                    <div className="text-[10px] font-black uppercase text-primary mb-1">{f.name}</div>
                    <div className="text-[11px] font-bold">Extensão: {f.properties.distance} km</div>
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
                  <div className="p-2 font-sans">
                    <div className="text-[10px] font-black uppercase text-primary mb-1">{f.name}</div>
                    <div className="text-[11px] font-bold">Área: {f.properties.area} km²</div>
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
                <Popup>
                  <div className="font-sans">
                    <h4 className="font-bold text-xs uppercase">{f.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{f.properties.description}</p>
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
              <Marker key={`active-${i}`} position={p} icon={new L.DivIcon({
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
                positions={[...activePoints, activePoints[0]]} 
                color="#3b82f6" 
                fillOpacity={0.1}
                weight={1}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Floating Metrics Card during drawing */}
      {activePoints.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-background/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-5">
           <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Pontos</span>
              <span className="text-lg font-black">{activePoints.length}</span>
           </div>
           <div className="flex flex-col border-l border-white/5 pl-8">
              <span className="text-[9px] font-black uppercase text-primary">Análise Parcial</span>
              <span className="text-lg font-black text-primary">
                {activeTool.includes('area') 
                  ? `${calculateSpatialMetrics('area', activePoints).area} km²`
                  : `${calculateSpatialMetrics('line', activePoints).distance} km`
                }
              </span>
           </div>
           <Button 
            size="sm" 
            className="rounded-xl font-black uppercase text-[10px] ml-4 h-10 px-6 shadow-xl shadow-primary/20"
            onClick={handleComplete}
           >
            Finalizar (Enter)
           </Button>
        </div>
      )}
    </div>
  );
}
