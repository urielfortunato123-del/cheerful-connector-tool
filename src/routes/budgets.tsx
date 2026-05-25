import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronRight, ChevronLeft, Calculator, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { askGeneralAI } from "@/lib/server-fns";

export const Route = createFileRoute("/budgets")({
  component: Budgets,
});

const steps = [
  "Órgão & Rodovia",
  "Segmento",
  "Serviço",
  "Parâmetros Técnicos",
  "Resultado",
];

function Budgets() {
  const [currentStep, setCurrentStep] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getAiHelp = async () => {
    setIsAiLoading(true);
    try {
      const response = await (askGeneralAI as any)({ 
        data: { 
          question: `Estou no passo ${currentStep} (${steps[currentStep-1]}) de um orçamento de infraestrutura. Me dê uma dica técnica ou valide o que estou fazendo.`,
          context: `Usuário está criando um orçamento no módulo de Budgets. Atualmente no passo: ${steps[currentStep-1]}.`
        } 
      });
      setAiSuggestion((response as any).answer);
    } catch (error) {
      toast.error("IA temporariamente indisponível.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    if (currentStep === 4) toast.success("Cálculo realizado com sucesso!");
  };
  
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerador de Orçamento Inteligente</h1>
          <span className="text-sm text-muted-foreground">Passo {currentStep} de 5</span>
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2" />
        <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
          {steps.map((step, i) => (
            <span key={i} className={currentStep === i + 1 ? "text-primary font-bold" : ""}>
              {step}
            </span>
          ))}
        </div>
      </div>

      <Card className="glass-card min-h-[400px]">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]}</CardTitle>
          <CardDescription>Preencha as informações para o cálculo técnico.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Órgão Responsável</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione o órgão" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="der">DER-SP</SelectItem>
                    <SelectItem value="dnit">DNIT</SelectItem>
                    <SelectItem value="artesp">ARTESP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rodovia</Label>
                <Input placeholder="Ex: SP-300 (Marechal Rondon)" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>KM Inicial</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>KM Final</Label>
                <Input type="number" placeholder="10" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Lado</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione o lado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="n">Norte (Direito)</SelectItem>
                    <SelectItem value="s">Sul (Esquerdo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresagem">Fresagem e Recomposição</SelectItem>
                    <SelectItem value="tapa">Tapa-Buraco</SelectItem>
                    <SelectItem value="drenagem">Drenagem Profunda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Espessura (cm)</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label>Largura da Faixa (m)</Label>
                <Input type="number" defaultValue="3.5" />
              </div>
              <div className="space-y-2">
                <Label>DMT (km)</Label>
                <Input type="number" placeholder="Distância de transporte" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de CBUQ</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fa">Faixa A</SelectItem>
                    <SelectItem value="fb">Faixa B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Volume Estimado:</span>
                  <span className="text-xl font-bold">1.250 m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tonelagem:</span>
                  <span className="text-xl font-bold">3.000 t</span>
                </div>
                <div className="pt-4 border-t border-primary/20 flex justify-between items-center">
                  <span className="text-lg font-bold">Custo Estimado:</span>
                  <span className="text-2xl font-bold text-primary">R$ 1.450.000,00</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full gap-2"><CheckCircle2 className="h-4 w-4" /> Salvar Projeto</Button>
                <Button variant="outline" className="w-full gap-2"><Calculator className="h-4 w-4" /> Exportar Planilha</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {aiSuggestion && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-2">
              <p className="font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                Sugestão da IA <Sparkles className="h-3 w-3" />
              </p>
              <p className="text-muted-foreground leading-relaxed">{aiSuggestion}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={getAiHelp} disabled={isAiLoading} className="gap-2 border-primary/20 hover:bg-primary/5">
            {isAiLoading ? "Analisando..." : "Dica da IA"} <Bot className="h-3.5 w-3.5 text-primary" />
          </Button>
        </div>

        <Button onClick={nextStep} className={currentStep === 5 ? "hidden" : ""}>
          {currentStep === 4 ? "Calcular" : "Próximo"} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
