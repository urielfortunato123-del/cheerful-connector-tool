import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Download, FileText, LayoutList } from "lucide-react";

export const Route = createFileRoute("/ai-assistant")({
  component: AIAssistant,
});

function AIAssistant() {
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto space-y-4">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Bot className="text-white h-6 w-6" />
          </div>
          <Card className="glass-card">
            <CardContent className="pt-4">
              <p className="text-sm">
                Olá! Sou seu copiloto técnico da InfraFlow. Como posso ajudar com sua obra hoje?
                <br /><br />
                Posso ajudar a calcular volumes, interpretar normas DNIT/DER, gerar memoriais ou tirar dúvidas executivas.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" size="sm">Como calcular aterro?</Button>
                <Button variant="outline" size="sm">Dúvida sobre CBUQ</Button>
                <Button variant="outline" size="sm">Norma de Drenagem</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 glass-card rounded-xl">
        <Input 
          placeholder="Digite sua dúvida técnica ou peça um cálculo..." 
          className="flex-1 bg-transparent border-none focus-visible:ring-0"
        />
        <Button size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center gap-4 py-2 border-t border-border">
        <Button variant="ghost" size="sm" className="gap-2">
          <FileText className="h-4 w-4" /> Gerar Memorial
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <LayoutList className="h-4 w-4" /> Checklist DNIT
        </Button>
      </div>
    </div>
  );
}
