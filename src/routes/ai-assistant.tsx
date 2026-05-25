import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Download, FileText, LayoutList, User, Loader2, Sparkles, Database } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { askGeneralAI } from "@/lib/server-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db, ChatMessage } from "@/lib/db";
import { searchDocuments } from "@/lib/document-processor";

export const Route = createFileRoute("/ai-assistant")({
  component: AIAssistant,
});

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadChatHistory = async () => {
    const history = await db.chatHistory.orderBy('timestamp').toArray();
    if (history.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Olá! Sou seu copiloto técnico da InfraFlow. Como posso ajudar com sua obra hoje?\n\nPosso ajudar a interpretar normas DER/DNIT, consultar sua biblioteca local ou fundamentar decisões técnicas.",
          timestamp: Date.now()
        }
      ]);
    } else {
      setMessages(history);
    }
  };

  const handleAsk = async (e?: React.FormEvent, presetQuestion?: string) => {
    e?.preventDefault();
    const finalQuestion = presetQuestion || question;
    if (!finalQuestion.trim()) return;

    const userMsg: ChatMessage = { 
      role: "user", 
      content: finalQuestion, 
      timestamp: Date.now() 
    };

    setQuestion("");
    setMessages(prev => [...prev, userMsg]);
    await db.chatHistory.add(userMsg);
    
    setIsLoading(true);
    setIsSearching(true);

    try {
      // 1. RAG Local: Search for relevant documents
      const relevantDocs = await searchDocuments(finalQuestion);
      const contextDocs = relevantDocs.slice(0, 3);
      const contextText = contextDocs
        .map(d => `[Doc: ${d.nome}] Categoria: ${d.categoria}. Conteúdo: ${d.textoExtraido?.substring(0, 1000)}`)
        .join('\n---\n');

      setIsSearching(false);

      // 2. Call AI with context
      const aiResponse = await (askGeneralAI as any)({ 
        data: { 
          question: finalQuestion,
          context: contextText ? `Baseie sua resposta nos seguintes documentos locais:\n${contextText}` : "Responda como um engenheiro especialista em infraestrutura rodoviária."
        } 
      });

      const assistantMsg: ChatMessage = { 
        role: "assistant", 
        content: (aiResponse as any).answer, 
        timestamp: Date.now(),
        contextDocs: contextDocs.map(d => d.id!)
      };

      setMessages(prev => [...prev, assistantMsg]);
      await db.chatHistory.add(assistantMsg);
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Erro ao consultar a IA.");
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua solicitação técnica. Verifique sua conexão.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const clearHistory = async () => {
    if (confirm("Deseja limpar o histórico de conversas?")) {
      await db.chatHistory.clear();
      setMessages([
        {
          role: "assistant",
          content: "Histórico limpo. Como posso ajudar agora?",
          timestamp: Date.now()
        }
      ]);
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
            <h2 className="font-bold text-lg">Engenheiro IA InfraFlow</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sincronizado com Biblioteca Local
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" onClick={clearHistory} className="h-8 text-xs opacity-60 hover:opacity-100">
             Limpar Chat
           </Button>
           <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-primary/20 hover:bg-primary/5 text-primary">
             <Sparkles className="h-3.5 w-3.5" /> Modo Specialist
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
                
                {msg.contextDocs && msg.contextDocs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Database className="h-3 w-3" /> Baseado em Documentos Locais:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.contextDocs.map((docId, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[9px] py-0 px-2 h-5 bg-primary/10 border-primary/20 text-primary">
                          Doc #{docId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {i === 0 && msg.role === "assistant" && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="secondary" size="sm" className="text-[11px] h-7" onClick={() => handleAsk(undefined, "Quais as normas de as-built do DER?")}>Normas As-Built DER</Button>
                    <Button variant="secondary" size="sm" className="text-[11px] h-7" onClick={() => handleAsk(undefined, "Como calcular produtividade de terraplenagem?")}>Cálculo Terraplenagem</Button>
                    <Button variant="secondary" size="sm" className="text-[11px] h-7" onClick={() => handleAsk(undefined, "Especificação de CBUQ para rodovia classe I")}>Especificação CBUQ</Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <AnimatePresence>
            {(isLoading || isSearching) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-muted/50 border border-border/50 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground italic">
                    {isSearching ? "Pesquisando em sua biblioteca local..." : "Gerando resposta técnica baseada nas normas..."}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleAsk} className="p-4 border-t border-border/50 bg-muted/10">
        <div className="flex items-center gap-3 bg-background border border-border/50 p-2 pl-4 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Input 
            placeholder="Consulte sua biblioteca técnica DER/DNIT..." 
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
          InfraFlow AI Engine • PWA Local Memory Mode
        </p>
      </form>
    </div>
  );
}
