import { Sparkles, X, ChevronRight, ShieldAlert, BadgeInfo, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapFeature } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GISAIInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  feature: MapFeature | null;
}

export default function GISAIInsights({ isOpen, onClose, feature }: GISAIInsightsProps) {
  if (!isOpen || !feature) return null;

  return (
    <div className="absolute top-20 right-4 w-80 z-[1001] bg-background/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col max-h-[70vh]">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tighter">Consultoria Geo-IA</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-5">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <BadgeInfo className="h-3 w-3" /> Objeto: {feature.name}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[9px] text-muted-foreground uppercase">Extensão</div>
                <div className="text-xs font-black">{feature.properties.distance} km</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[9px] text-muted-foreground uppercase">Risco</div>
                <div className="text-xs font-black text-orange-500">MÉDIO</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> Riscos Identificados
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] leading-relaxed">
                <span className="font-black text-red-500">EROSÃO:</span> Alta probabilidade de solapamento lateral devido à declividade acentuada.
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[10px] leading-relaxed">
                <span className="font-black text-blue-500">DRENAGEM:</span> Necessita bueiro duplo no ponto central para evitar acúmulo hídrico.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Scale className="h-3 w-3" /> Normas DER/DNIT
            </h4>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-[10px] space-y-2">
              <p>• <span className="font-black">ET-P00:</span> Revestimento asfáltico tipo CBUQ recomendado.</p>
              <p>• <span className="font-black">Manual de Drenagem:</span> Critério de recorrência de 50 anos para obras de arte correntes.</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-5 border-t border-white/5">
        <Button className="w-full font-black uppercase text-[10px] h-10 rounded-xl shadow-xl shadow-primary/20">
          Gerar Laudo Técnico <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
