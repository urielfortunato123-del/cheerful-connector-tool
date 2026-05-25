import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Download, FileText, LayoutList, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { askGeneralAI } from "@/lib/server-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/ai-assistant")({
  component: AIAssistant,
});

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu copiloto técnico da InfraFlow. Como posso ajudar com sua obra hoje?\n\nPosso ajudar a calcular volumes, interpretar normas DNIT/DER, gerar memoriais ou tirar dúvidas executivas."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e?: React.FormEvent, presetQuestion?: string) => {
    e?.preventDefault();
    const finalQuestion = presetQuestion || question;
    if (!finalQuestion.trim()) return;

    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: finalQuestion }]);
    setIsLoading(true);

    try {
      const response = await (askGeneralAI as any)({ data: { question: finalQuestion } });
      setMessages(prev => [...prev, { role: "assistant", content: (response as any).answer }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Erro ao consultar a IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto border border-border/50 rounded-2xl overflow-hidden bg-card shadow-xl">
      <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="text-primary-foreground h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Assistente Global InfraFlow</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              IA Ativa: DeepSeek V4 Flash
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 opacity-60 hover:opacity-100">
             <FileText className="h-3.5 w-3.5" /> Memorial
           </Button>
           <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 opacity-60 hover:opacity-100">
             <LayoutList className="h-3.5 w-3.5" /> Checklist
           </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border/50"
              }`}>
                {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-muted/50 border border-border/50 rounded-tl-none prose prose-invert"
              }`}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-2" : ""}>{line}</p>
                ))}
                
                {i === 0 && msg.role === "assistant" && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="secondary" size="sm" className="text-[11px] h-7" onClick={() => handleAsk(undefined, "Como calcular aterro?")}>Como calcular aterro?</Button>
                    <Button variant="secondary" size="sm" className="text-[11px] h-7" onClick={() => handleAsk(undefined, "O que diz a norma sobre CBUQ?")}>Dúvida sobre CBUQ</Button>
                    <Button variant="secondary" size="sm" className="text-[11px] h-7" onClick={() => handleAsk(undefined, "Norma de Drenagem DNIT")}>Norma de Drenagem</Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-muted/50 border border-border/50 p-4 rounded-2xl rounded-tl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <form onSubmit={handleAsk} className="p-4 border-t border-border/50 bg-muted/10">
        <div className="flex items-center gap-3 bg-background border border-border/50 p-2 pl-4 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Input 
            placeholder="Digite sua dúvida técnica ou peça um cálculo..." 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none p-0 h-10"
          />
          <Button type="submit" size="icon" disabled={isLoading || !question.trim()} className="rounded-lg shadow-lg shadow-primary/20">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3 opacity-50 uppercase tracking-widest">
          InfraFlow AI Engine • Powered by DeepSeek
        </p>
      </form>
    </div>
  );
}
