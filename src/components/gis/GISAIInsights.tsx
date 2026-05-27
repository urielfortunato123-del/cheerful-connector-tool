import { Sparkles, X, ChevronRight, ShieldAlert, BadgeInfo, Scale, Droplets, HardHat, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapFeature } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";

interface GISAIInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  feature: MapFeature | null;
}

export default function GISAIInsights({ isOpen, onClose, feature }: GISAIInsightsProps) {
  const insights = useMemo(() => {
    if (!feature) return null;

    const { type, properties } = feature;
    const isHighRisk = (properties.distance || 0) > 5 || (properties.area || 0) > 10;
    
    const observations = [
      {
        id: 'topography',
        title: 'Análise de Declividade',
        desc: (properties.distance || 0) > 2 ? 'Trecho com variação altimétrica significativa sugerida.' : 'Topografia aparentemente estável para este segmento.',
        icon: TrendingDown,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20'
      },
      {
        id: 'drainage',
        title: 'Sugestão de Drenagem',
        desc: type === 'line' ? 'Recomenda-se valeta de proteção de aterro (VPA) nos primeiros 500m.' : 'Área requer análise de bacia de detenção para controle de cheias.',
        icon: Droplets,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
      },
      {
        id: 'standard',
        title: 'Normas Aplicáveis',
        desc: 'Conformidade com DNIT 013/2004-ES para serviços de terraplenagem.',
        icon: Scale,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20'
      }
    ];

    return {
      riskLevel: isHighRisk ? 'ALTO' : 'MÉDIO',
      riskColor: isHighRisk ? 'text-red-500' : 'text-orange-500',
      observations
    };
  }, [feature]);

  if (!isOpen || !feature || !insights) return null;

  return (
    <div className="absolute top-20 right-4 w-96 z-[1001] bg-background/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col max-h-[75vh]">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/20 shadow-lg shadow-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tighter leading-none">Geo-IA Specialist</h3>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Análise Técnica V5.2</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/5">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <BadgeInfo className="h-3.5 w-3.5" /> Metadados do Objeto
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Métrica</div>
                <div className="text-sm font-black">
                  {feature.properties.distance ? `${feature.properties.distance} km` : feature.properties.area ? `${feature.properties.area} km²` : 'Geometria Local'}
                </div>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Status de Risco</div>
                <div className={cn("text-sm font-black", insights.riskColor)}>{insights.riskLevel}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5" /> Diagnóstico de Engenharia
            </h4>
            <div className="space-y-3">
              {insights.observations.map((obs) => (
                <div key={obs.id} className={cn("p-4 rounded-3xl border transition-all hover:scale-[1.02]", obs.bg, obs.border)}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("p-2 rounded-xl bg-background shadow-sm", obs.color)}>
                      <obs.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tighter">{obs.title}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed font-medium opacity-90 italic">
                    "{obs.desc}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <HardHat className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Observações Normativas</span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                <p className="text-[9px] font-bold text-muted-foreground leading-tight uppercase">Manual de Pavimentação DNIT: Volume de tráfego sugerido tipo Meio-Pesado.</p>
              </div>
              <div className="flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                <p className="text-[9px] font-bold text-muted-foreground leading-tight uppercase">Critério de Rigidez: Recomendado Módulo de Resiliência > 150 MPa.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-white/5">
        <Button className="w-full font-black uppercase text-[10px] h-12 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          Gerar Laudo Geo-Técnico <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Helper to use cn in this component if not imported
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
