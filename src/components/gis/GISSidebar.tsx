import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapFeature, db } from "@/lib/db";
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
  TrafficCone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GISSidebarProps {
  features: MapFeature[];
  onSelect: (feature: MapFeature) => void;
  onDelete: (id: number) => void;
  onDuplicate: (feature: MapFeature) => void;
  onExport: () => void;
}

export default function GISSidebar({ 
  features, 
  onSelect, 
  onDelete, 
  onDuplicate,
  onExport 
}: GISSidebarProps) {
  const [activeTab, setActiveTab] = useState("features");

  const layers = [
    { id: 'obras', label: 'Obras em Curso', icon: HardHat, color: 'text-orange-500' },
    { id: 'drenagem', label: 'Drenagem', icon: Droplets, color: 'text-blue-500' },
    { id: 'pavimentacao', label: 'Pavimentação', icon: Box, color: 'text-slate-500' },
    { id: 'contratos', label: 'Contratos/Áreas', icon: BadgeAlert, color: 'text-red-500' },
    { id: 'sinalizacao', label: 'Sinalização', icon: TrafficCone, color: 'text-yellow-500' },
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
            LIVE
          </span>
        </div>
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
          Central Geoespacial Operacional
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-3 bg-white/5 p-1 rounded-xl border border-white/5">
            <TabsTrigger value="features" className="text-[10px] uppercase font-black tracking-tighter rounded-lg">Dados</TabsTrigger>
            <TabsTrigger value="layers" className="text-[10px] uppercase font-black tracking-tighter rounded-lg">Camadas</TabsTrigger>
            <TabsTrigger value="history" className="text-[10px] uppercase font-black tracking-tighter rounded-lg">Insights</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="features" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
            <h3 className="text-[11px] font-black uppercase tracking-tighter flex items-center gap-2">
              <Filter className="h-3 w-3" /> Objetos Espaciais
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExport} title="Exportar GeoJSON">
              <Download className="h-3 w-3" />
            </Button>
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
                    className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.01]"
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
                          <h4 className="font-black text-xs uppercase tracking-tighter group-hover:text-primary transition-colors">{f.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">
                              {f.category}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <span className="text-[9px] font-bold text-primary">
                              {f.properties.distance ? `${f.properties.distance} km` : `${f.properties.area} km²`}
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
                      >
                        Detalhes <Edit2 className="h-2.5 w-2.5 ml-1.5" />
                      </Button>
                    </div>

                    {/* Barra de destaque por categoria */}
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

        <TabsContent value="layers" className="flex-1 p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground">Filtros Temáticos</h3>
            <div className="grid gap-2">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-lg bg-background group-hover:scale-110 transition-transform", layer.color)}>
                      <layer.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tighter">{layer.label}</span>
                  </div>
                  <div className="h-5 w-9 bg-primary/20 rounded-full relative border border-primary/20">
                    <div className="h-3.5 w-3.5 bg-primary rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-primary/10 border border-primary/10">
            <h4 className="text-[10px] font-black text-primary uppercase mb-3 flex items-center gap-2">
              <BadgeAlert className="h-3.5 w-3.5" /> Alertas de Normas
            </h4>
            <div className="space-y-2">
              <div className="p-2 bg-background/50 rounded-xl border border-white/5 text-[9px]">
                <span className="font-bold text-red-500 uppercase">Gargalo:</span> KM 12 ao 14 necessita recomposição de sinalização vertical.
              </div>
              <div className="p-2 bg-background/50 rounded-xl border border-white/5 text-[9px]">
                <span className="font-bold text-orange-500 uppercase">Aviso:</span> Recomenda-se espessura de 12cm conforme DER ET-P00.
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
              <Sparkles className="h-10 w-10 text-primary/30 mb-4 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-tighter mb-2">Geo-IA Preditiva</h4>
              <p className="text-[10px] text-muted-foreground px-4 leading-relaxed">
                A inteligência artificial está processando os dados espaciais para sugerir otimizações de traçado e orçamento.
              </p>
              <Button size="sm" className="mt-6 font-black uppercase text-[10px] h-8 rounded-xl">
                Ativar Consultoria IA
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-5 border-t border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
          <History className="h-3 w-3" /> Sync: Offline-First
        </div>
        <div className="flex gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
      </div>
    </div>
  );
}
