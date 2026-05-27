import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapFeature, db } from "@/lib/db";
import { 
  Trash2, 
  Send, 
  Layers, 
  History, 
  Info, 
  Sparkles,
  ChevronRight,
  MapPin,
  Ruler,
  FileSpreadsheet,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";

interface MapSidebarProps {
  features: MapFeature[];
  onSelect: (feature: MapFeature) => void;
  onDelete: (id: number) => void;
  onForward: (feature: MapFeature, destination: 'budget' | 'project') => void;
  onAIRequest: (prompt: string) => void;
}

export default function MapSidebar({ 
  features, 
  onSelect, 
  onDelete, 
  onForward,
  onAIRequest
}: MapSidebarProps) {
  const [aiPrompt, setAiPrompt] = useState("");

  const handleAIAction = () => {
    if (!aiPrompt.trim()) return;
    onAIRequest(aiPrompt);
    setAiPrompt("");
  };

  return (
    <div className="w-80 h-full border-r border-border bg-card flex flex-col animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Painel de Controle GIS
        </h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
          InfraFlow Professional
        </p>
      </div>

      <Tabs defaultValue="levantamentos" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="levantamentos" className="text-[10px] uppercase font-bold">Dados</TabsTrigger>
            <TabsTrigger value="camadas" className="text-[10px] uppercase font-bold">Mapa</TabsTrigger>
            <TabsTrigger value="ia" className="text-[10px] uppercase font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> IA
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="levantamentos" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase text-muted-foreground tracking-tighter">Medições Salvas</h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  {features.length}
                </span>
              </div>

              {features.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/10">
                  <Info className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground px-4">Use a ferramenta de medição no mapa para começar.</p>
                </div>
              ) : (
                features.map((f) => (
                  <div 
                    key={f.id}
                    className="group bg-muted/30 hover:bg-muted/60 border border-border rounded-xl p-3 transition-all cursor-pointer hover:shadow-md"
                    onClick={() => onSelect(f)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-xs group-hover:text-primary transition-colors">{f.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {f.type === 'line' ? <Ruler className="h-3 w-3 text-blue-500" /> : <MapPin className="h-3 w-3 text-red-500" />}
                          <span className="text-[10px] text-muted-foreground">
                            {f.properties.distance ? `${f.properties.distance} km` : `${f.coordinates.length} pontos`}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); if(f.id) onDelete(f.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-[9px] font-bold uppercase"
                        onClick={(e) => { e.stopPropagation(); onForward(f, 'budget'); }}
                      >
                        <FileSpreadsheet className="h-3 w-3 mr-1 text-green-500" /> +Orçamento
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-[9px] font-bold uppercase"
                        onClick={(e) => { e.stopPropagation(); onForward(f, 'project'); }}
                      >
                        <Briefcase className="h-3 w-3 mr-1 text-blue-500" /> +Projeto
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="camadas" className="p-4 flex-1 overflow-hidden">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase text-muted-foreground tracking-tighter mb-2">Camadas de Engenharia</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/50">
                <span className="text-xs font-medium">Satélite Alta Resolução</span>
                <div className="h-4 w-8 bg-primary rounded-full relative"><div className="h-3 w-3 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/50 opacity-50">
                <span className="text-xs font-medium">Contornos de Nível (SRTM)</span>
                <div className="h-4 w-8 bg-muted rounded-full relative"><div className="h-3 w-3 bg-white rounded-full absolute left-0.5 top-0.5" /></div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/50 opacity-50">
                <span className="text-xs font-medium">Drenagem e Hidrografia</span>
                <div className="h-4 w-8 bg-muted rounded-full relative"><div className="h-3 w-3 bg-white rounded-full absolute left-0.5 top-0.5" /></div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-border/50">
              <h3 className="text-[11px] font-black uppercase text-muted-foreground tracking-tighter mb-2">Legenda Profissional</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-4 bg-orange-500 rounded" />
                  <span className="text-[10px]">Eixo Projetado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-4 bg-blue-500 rounded" />
                  <span className="text-[10px]">Drenagem Executada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-4 border-2 border-dashed border-red-500" />
                  <span className="text-[10px]">Área de Empréstimo</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ia" className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-muted/20 rounded-xl p-4 border border-border/50 flex flex-col">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-tighter">Assistente Geo-IA</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
              Dê comandos como: \\"Sugira áreas de bota-fora próximas ao KM 12\\" ou \\"Calcule volume aproximado de aterro para este trecho\\".
            </p>
            <div className="mt-auto space-y-2">
              <Input 
                placeholder="Como posso ajudar no mapa?" 
                className="text-xs h-9 bg-background"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIAction()}
              />
              <Button size="sm" className="w-full text-xs font-bold gap-2" onClick={handleAIAction}>
                Processar com IA <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase">Sugestões Contextuais</h4>
            <Button variant="ghost" className="w-full justify-start text-[10px] h-auto py-2 text-left hover:bg-primary/5">
              • Otimizar traçado para reduzir corte
            </Button>
            <Button variant="ghost" className="w-full justify-start text-[10px] h-auto py-2 text-left hover:bg-primary/5">
              • Identificar pontos críticos de erosão
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-4 border-t border-border bg-muted/10">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <History className="h-3 w-3" />
          Última Sync: Agora
        </div>
      </div>
    </div>
  );
}