import { useState } from "react";
import { Send, Bot, User, Loader2, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askLibraryAI } from "@/lib/server-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function AskAI({ context }: { context?: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = question;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Use any to bypass the missing validator issue in this environment's types
      const response = await (askLibraryAI as any)({ data: { question: userMsg, context } });
      setMessages(prev => [...prev, { role: "assistant", content: (response as any).answer }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Erro ao consultar a IA. Verifique se você está logado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-border/50 rounded-xl overflow-hidden bg-muted/10">
      <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Co-piloto da Biblioteca Técnica</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground p-6">
            <Library className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Faça uma pergunta técnica baseada nos seus documentos.</p>
            <p className="text-sm mb-6 opacity-70 italic">O Co-piloto analisará as normas e manuais indexados para responder.</p>
            
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Como elaborar as-built?",
                "Normas para sinalização",
                "Padrão de drenagem DER",
                "Manual de pavimentação"
              ].map(q => (
                <Button 
                  key={q} 
                  variant="outline" 
                  size="sm" 
                  className="text-[10px] h-7 bg-background/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                  onClick={() => { setQuestion(q); }}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border/50"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted/50 border border-border/50 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted/50 border border-border/50 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleAsk} className="p-4 border-t border-border/50 bg-muted/20 flex gap-2">
        <Input 
          placeholder="Pergunte aos documentos..." 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          className="bg-background border-border/50"
        />
        <Button type="submit" disabled={isLoading || !question.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
