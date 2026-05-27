import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapFeature } from "@/lib/db";
import { 
  Layers, 
  History, 
  Sparkles,
  MapPin,
  Ruler,
  Trash2,
  Copy,
  Edit2,
  Filter,
  Download,
  Box,
  Droplets,
  HardHat,
  BadgeAlert,
  TrafficCone,
  Map as MapIcon,
  Navigation,
  Activity,
  Waves,
  Mountain,
  FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseLayer, EngineeringLayer } from "./GISContainer";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GISSidebarProps {
  features: MapFeature[];
  onSelect: (feature: MapFeature) => void;
  onDelete: (id: number) => void;
  onEdit: (feature: MapFeature) => void;
  onDuplicate: (feature: MapFeature) => void;
  onExport: () => void;
  onExportKML: () => void;
  activeBaseLayer: BaseLayer;
  onBaseLayerChange: (layer: BaseLayer) => void;
  activeEngineeringLayers: Set<EngineeringLayer>;
  onEngineeringLayerToggle: (layer: EngineeringLayer) => void;
  gpsMode: 'standard' | 'high_precision' | 'economy' | 'engineering';
  onGpsModeChange: (mode: 'standard' | 'high_precision' | 'economy' | 'engineering') => void;
  isGpsActive: boolean;
  onGpsToggle: () => void;
}

export default function GISSidebar({ 
  features, 
  onSelect, 
  onDelete, 
  onEdit,
  onDuplicate,
  onExport,
  onExportKML,
  activeBaseLayer,
  onBaseLayerChange,
  activeEngineeringLayers,
  onEngineeringLayerToggle,
  gpsMode,
  onGpsModeChange,
  isGpsActive,
  onGpsToggle
}: GISSidebarProps) {
  const [activeTab, setActiveTab] = useState("features");

  const engineeringLayers: { id: EngineeringLayer, label: string, icon: any, color: string }[] = [
    { id: 'obras', label: 'Obras em Curso', icon: HardHat, color: 'text-orange-500' },
    { id: 'drenagem', label: 'Drenagem', icon: Droplets, color: 'text-blue-500' },
    { id: 'pavimentacao', label: 'Pavimentação', icon: Box, color: 'text-slate-500' },
    { id: 'hidrografia', label: 'Hidrografia', icon: Waves, color: 'text-cyan-600' },
    { id: 'curvas_nivel', label: 'Curvas de Nível', icon: Mountain, color: 'text-emerald-600' },
    { id: 'contratos', label: 'Contratos/Áreas', icon: BadgeAlert, color: 'text-red-500' },
    { id: 'sinalizacao', label: 'Sinalização', icon: TrafficCone, color: 'text-yellow-500' },
  ];

  const baseLayers: { id: BaseLayer, label: string }[] = [
    { id: 'dark', label: 'Dark Mode (Engine)' },
    { id: 'satellite', label: 'Dinâmico (Auto)' },
    { id: 'google-satellite', label: 'Google Satellite' },
    { id: 'mapbox-satellite', label: 'Mapbox HD' },
    { id: 'esri-world', label: 'Esri World' },
    { id: 'topography', label: 'Topografia' },
    { id: 'streets', label: 'Ruas' },
  ];

  return (
    <div className="w-80 h-full border-r border-white/10 bg-background/60 backdrop-blur-3xl flex flex-col z-[1001] animate-in slide-in-from-left duration-500 shadow-2xl">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-black tracking-tighter uppercase flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            InfraMap GIS
          </h2>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold animate-pulse">
            V5.0
          </span>
        </div>
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
          Central Geoespacial Profissional
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-3 bg-white/5 p-1 rounded-xl border border-white/5">
            <TabsTrigger value="features" className="text-[10px] uppercase font-black tracking-tighter rounded-lg">Dados</TabsTrigger>
            <TabsTrigger value="layers" className="text-[10px] uppercase font-black tracking-tighter rounded-lg">Mapa</TabsTrigger>
            <TabsTrigger value="gps" className="text-[10px] uppercase font-black tracking-tighter rounded-lg">GPS</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="features" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
            <h3 className="text-[11px] font-black uppercase tracking-tighter flex items-center gap-2">
              <Filter className="h-3 w-3" /> Objetos Espaciais
            </h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExport} title="Exportar GeoJSON">
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExportKML} title="Exportar KML">
                <FileCode className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {features.length === 0 ? (
                <div className="text-center py-12 px-6 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <Box className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Nenhum dado capturado</p>
                </div>
              ) : (
                features.map((f) => (
                  <div 
                    key={f.id}
                    className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 transition-all cursor-pointer hover:shadow-xl"
                    onClick={() => onSelect(f)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div className={cn(
                          "p-2 rounded-xl bg-background shadow-inner",
                          f.type === 'line' ? "text-blue-500" : f.type === 'area' ? "text-orange-500" : "text-red-500"
                        )}>
                          {f.type === 'line' ? <Ruler className="h-4 w-4" /> : f.type === 'area' ? <Layers className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-black text-xs uppercase tracking-tighter group-hover:text-primary transition-colors line-clamp-1">{f.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">
                              {f.category}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <span className="text-[9px] font-bold text-primary">
                              {f.properties.distance ? `${f.properties.distance} km` : f.properties.area ? `${f.properties.area} km²` : 'Ponto'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg bg-background/50 hover:bg-background"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(f); }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg bg-background/50 hover:bg-background text-destructive"
                        onClick={(e) => { e.stopPropagation(); if(f.id) onDelete(f.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="flex-1" />
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="h-7 text-[9px] font-bold uppercase rounded-lg px-3"
                        onClick={(e) => { e.stopPropagation(); onEdit(f); }}
                      >
                        Editar <Edit2 className="h-2.5 w-2.5 ml-1.5" />
                      </Button>
                    </div>

                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 transition-all",
                      f.category === 'drenagem' ? "bg-blue-500" : f.category === 'obras' ? "bg-orange-500" : "bg-primary"
                    )} />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layers" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                  <MapIcon className="h-3 w-3" /> Mapa Base
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {baseLayers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => onBaseLayerChange(layer.id)}
                      className={cn(
                        "p-2 text-[10px] font-bold uppercase rounded-xl border transition-all text-center",
                        activeBaseLayer === layer.id 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3 w-3" /> Camadas Operacionais
                </h3>
                <div className="grid gap-2">
                  {engineeringLayers.map((layer) => (
                    <div 
                      key={layer.id} 
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                      onClick={() => onEngineeringLayerToggle(layer.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-lg bg-background group-hover:scale-110 transition-transform", layer.color)}>
                          <layer.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tighter">{layer.label}</span>
                      </div>
                      <Switch 
                        checked={activeEngineeringLayers.has(layer.id)}
                        onCheckedChange={() => onEngineeringLayerToggle(layer.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gps" className="flex-1 p-4 space-y-6">
          <div className="p-6 rounded-3xl bg-primary/10 border border-primary/10 flex flex-col items-center text-center">
            <div className={cn(
              "p-4 rounded-full mb-4 shadow-xl transition-all duration-500",
              isGpsActive ? "bg-primary text-primary-foreground scale-110 animate-pulse" : "bg-white/5 text-muted-foreground"
            )}>
              <Navigation className="h-8 w-8" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-tighter mb-2">GPS de Alta Precisão</h4>
            <p className="text-[10px] text-muted-foreground mb-6">
              Acompanhamento em tempo real para vistorias em campo.
            </p>
            <Button 
              className={cn("w-full font-black uppercase text-[10px] h-10 rounded-xl shadow-lg", isGpsActive && "bg-destructive hover:bg-destructive/90")}
              onClick={onGpsToggle}
            >
              {isGpsActive ? 'Desativar Rastreamento' : 'Ativar GPS Operacional'}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
              <Activity className="h-3 w-3" /> Configurações de Precisão
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Modo de Operação</span>
                <Select value={gpsMode} onValueChange={(val: any) => onGpsModeChange(val)}>
                  <SelectTrigger className="bg-white/5 border-white/5 text-xs h-9">
                    <SelectValue placeholder="Selecione o modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Padrão (Bateria)</SelectItem>
                    <SelectItem value="high_precision">Alta Precisão (L1/L2)</SelectItem>
                    <SelectItem value="engineering">Engenharia (RTK/NTRIP)</SelectItem>
                    <SelectItem value="economy">Econômico (Offline)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-5 border-t border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
          <History className="h-3 w-3" /> Offline-First: V5.2
        </div>
        <div className="flex gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
      </div>
    </div>
  );
}
