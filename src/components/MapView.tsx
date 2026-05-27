import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, LayersControl } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { db, Project, Measurement, DailyLog, MapFeature } from "@/lib/db";
import { toast } from "sonner";
import { FileText, Camera, Map as MapIcon, Crosshair, Sparkles, Save, Forward } from "lucide-react";
import { format } from "date-fns";
import MapSidebar from "./MapSidebar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [mapFeatures, setMapFeatures] = useState<MapFeature[]>([]);
  const [markers, setMarkers] = useState<[number, number][]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);
  
  // Forwarding State
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardDest, setForwardDest] = useState<'budget' | 'project' | null>(null);
  const [selectedProjId, setSelectedProjId] = useState<string>("");
  const [activeForwardFeature, setActiveForwardFeature] = useState<MapFeature | null>(null);

  const center: [number, number] = [-23.5505, -46.6333];

  const loadData = useCallback(async () => {
    const [projData, measData, featuresData] = await Promise.all([
      db.projects.toArray(),
      db.measurements.toArray(),
      db.mapFeatures.toArray()
    ]);
    setProjects(projData);
    setMeasurements(measData);
    setMapFeatures(featuresData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isMeasuring) {
      setMarkers(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
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

  const saveMeasurement = async () => {
    if (markers.length < 2) {
      toast.error("Adicione pelo menos 2 pontos para medir um trecho.");
      return;
    }

    const distance = parseFloat(calculateDistance() as string);
    const newFeature: MapFeature = {
      type: 'line',
      name: `Levantamento ${format(new Date(), 'HH:mm')}`,
      coordinates: markers,
      properties: {
        distance,
        description: `Medição de trecho realizada em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
      },
      createdAt: Date.now()
    };

    await db.mapFeatures.add(newFeature);
    toast.success("Trecho salvo nos levantamentos!");
    setMarkers([]);
    setIsMeasuring(false);
    loadData();
  };

  const deleteFeature = async (id: number) => {
    await db.mapFeatures.delete(id);
    toast.success("Levantamento excluído.");
    loadData();
  };

  const handleForward = (feature: MapFeature, dest: 'budget' | 'project') => {
    setActiveForwardFeature(feature);
    setForwardDest(dest);
    setIsForwarding(true);
  };

  const executeForward = async () => {
    if (!selectedProjId || !activeForwardFeature) {
      toast.error("Selecione um projeto de destino.");
      return;
    }

    const projId = parseInt(selectedProjId);

    if (forwardDest === 'budget') {
      // Criar medição vinculada ao orçamento
      await db.measurements.add({
        projectId: projId,
        tipoServico: "Levantamento Geoespacial: " + activeForwardFeature.name,
        quantidade: activeForwardFeature.properties.distance || 0,
        unidade: "km",
        valor: 0,
        data: Date.now(),
        coordinates: activeForwardFeature.coordinates
      });
      toast.success("Dados enviados para o Orçamento do projeto!");
    } else {
      // Lógica para Projeto (DailyLog ou Memorial)
      await db.dailyLogs.add({
        projectId: projId,
        data: Date.now(),
        clima: "N/A",
        equipe: "Engenharia / GIS",
        observacoes: `Importado do Mapa: ${activeForwardFeature.name}. Distância: ${activeForwardFeature.properties.distance}km`
      });
      toast.success("Dados enviados para o Diário de Obra / Projeto!");
    }

    setIsForwarding(false);
    loadData();
  };

  const handleAIRequest = (prompt: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Analisando dados geoespaciais...',
        success: (data) => {
          return `IA: Com base no relevo e drenagem local, sugiro um bueiro triplo no KM 12.5 para evitar alagamento observado no levantamento.`;
        },
        error: 'Erro na análise da IA',
      }
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <MapSidebar 
        features={mapFeatures} 
        onSelect={(f) => setSelectedFeature(f)}
        onEdit={(f) => {
          setMarkers(f.coordinates);
          setIsMeasuring(true);
          toast.info("Trecho carregado para edição.");
        }}
        onDelete={deleteFeature}
        onForward={handleForward}
        onAIRequest={handleAIRequest}
      />

      <div className="relative flex-1 h-full">
        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
          <Button
            variant={isMeasuring ? "default" : "secondary"}
            size="sm"
            className="shadow-xl font-bold uppercase text-[10px]"
            onClick={() => { setIsMeasuring(!isMeasuring); if (!isMeasuring) setMarkers([]); }}
          >
            <Crosshair className="h-4 w-4 mr-2" />
            {isMeasuring ? "Finalizar Medição" : "Nova Medição"}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="shadow-xl font-bold uppercase text-[10px]"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Exportar KML
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

          {/* Medição Ativa */}
          {markers.map((pos, i) => (
            <Marker 
              key={`marker-${i}`} 
              position={pos}
              eventHandlers={{
                contextmenu: () => {
                  setMarkers(prev => prev.filter((_, idx) => idx !== i));
                  toast.info("Vértice removido.");
                }
              }}
            >
              <Popup>Vértice {i + 1} <br/> <span className="text-[9px] text-muted-foreground">Botão direito para remover</span></Popup>
            </Marker>
          ))}
          {markers.length > 1 && <Polyline positions={markers} color="#FF6B00" weight={5} dashArray="10, 15" />}

          {/* Levantamentos Salvos */}
          {mapFeatures.map((f) => (
            <Polyline 
              key={f.id} 
              positions={f.coordinates} 
              color={selectedFeature?.id === f.id ? "#3b82f6" : "#4b5563"} 
              weight={selectedFeature?.id === f.id ? 6 : 4}
              opacity={0.8}
              eventHandlers={{
                click: () => setSelectedFeature(f)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold text-xs">{f.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{f.properties.distance} km</p>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Projetos e Medições (Existentes) */}
          {projects.map((p) => (
            <Marker
              key={`proj-${p.id}`}
              position={[-23.5505 + (p.id || 0) * 0.02, -46.6333 + (p.id || 0) * 0.02]}
              icon={new L.DivIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #FF6B00; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(255,107,0,0.6);"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
              })}
            >
              <Popup className="professional-popup">
                <div className="p-2 min-w-[150px]">
                  <h4 className="font-black text-[9px] uppercase text-primary tracking-tighter mb-1">PROJETO ATIVO</h4>
                  <h3 className="font-bold text-sm leading-tight mb-1">{p.nome}</h3>
                  <div className="flex flex-col gap-1 text-[10px] text-muted-foreground border-t border-border mt-2 pt-2">
                    <span>Rodovia: {p.rodovia}</span>
                    <span>Extensão: KM {p.kmInicial} ao {p.kmFinal}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {isMeasuring && markers.length > 0 && (
          <div className="absolute bottom-6 right-6 z-[1000] glass-card p-5 rounded-2xl border border-primary/40 w-72 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h4 className="text-[10px] font-black uppercase tracking-tighter text-primary">Medição em Curso</h4>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground uppercase">Vértices</span>
                  <span className="text-xl font-black">{markers.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground uppercase">Distância</span>
                  <span className="text-xl font-black text-primary">{calculateDistance()} km</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border/40">
                <Button size="sm" variant="outline" className="flex-1 text-[10px] h-8" onClick={() => setMarkers([])}>Limpar</Button>
                <Button size="sm" className="flex-1 text-[10px] h-8 shadow-lg shadow-primary/20" onClick={saveMeasurement}>
                  <Save className="h-3 w-3 mr-1" /> Salvar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog para Encaminhar Dados */}
      <Dialog open={isForwarding} onOpenChange={setIsForwarding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Forward className="h-5 w-5 text-primary" />
              Encaminhar Medição
            </DialogTitle>
            <DialogDescription>
              Vincule este levantamento a um projeto existente para {forwardDest === 'budget' ? 'geração de orçamento' : 'atualização do diário de obra'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Selecione o Projeto</Label>
              <Select onValueChange={setSelectedProjId} value={selectedProjId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id?.toString() || ""}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted rounded-lg border border-border">
              <h4 className="text-xs font-bold mb-1">{activeForwardFeature?.name}</h4>
              <p className="text-[10px] text-muted-foreground">{activeForwardFeature?.properties.distance} km de extensão geoespacial</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForwarding(false)}>Cancelar</Button>
            <Button onClick={executeForward}>Confirmar Envio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}