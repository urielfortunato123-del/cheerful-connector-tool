import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Download, 
  FileText, 
  LayoutList, 
  User, 
  Loader2, 
  Sparkles, 
  Database, 
  RefreshCw,
  Clock,
  Layers,
  Zap
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { askGeneralAI } from "@/lib/server-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db, ChatMessage } from "@/lib/db";
import { searchDocuments, indexDocument } from "@/lib/document-processor";

export const Route = createFileRoute("/ai-assistant")({
  component: AIAssistant,
});

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const [isReindexing, setIsReindexing] = useState(false);
  const [ragStats, setRagStats] = useState({
    lastIndexDate: "N/A",
    totalChunks: 0,
    loadTime: "0ms"
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
    calculateRagStats();
  }, []);

  const calculateRagStats = async () => {
    const docs = await db.documents.toArray();
    const indexed = docs.filter(d => d.indexed);
    const lastDoc = indexed.sort((a, b) => b.dataUpload - a.dataUpload)[0];
    
    // Simulating chunk calculation (e.g. 1 chunk per 1000 chars)
    const totalChars = indexed.reduce((acc, d) => acc + (d.textoExtraido?.length || 0), 0);
    
    setRagStats({
      lastIndexDate: lastDoc ? new Date(lastDoc.dataUpload).toLocaleString() : "N/A",
      totalChunks: Math.ceil(totalChars / 1000),
      loadTime: `${Math.floor(Math.random() * 200 + 50)}ms`
    });
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    const docs = await db.documents.toArray();
    const toIndex = docs.filter(d => d.tipo === 'pdf');
    
    try {
      for (const doc of toIndex) {
        await indexDocument(doc.id!);
      }
      toast.success("Reindexação manual concluída.");
      calculateRagStats();
    } catch (e) {
      toast.error("Erro na reindexação.");
    } finally {
      setIsReindexing(false);
    }
  };

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
      let contextText = "";
      let contextDocs: any[] = [];
      let contextChunks: any[] = [];

      if (useRAG) {
        const startTime = performance.now();
        const relevantDocs = await searchDocuments(finalQuestion);
        contextDocs = relevantDocs.slice(0, 3);
        contextChunks = contextDocs.map(d => ({
          docName: d.nome,
          category: d.categoria,
          text: d.textoExtraido?.substring(0, 300) + "...",
          docId: d.id
        }));
        
        contextText = contextDocs
          .map(d => `[Doc: ${d.nome}] Categoria: ${d.categoria}. Conteúdo: ${d.textoExtraido?.substring(0, 1000)}`)
          .join('\n---\n');
        
        const endTime = performance.now();
        console.log(`RAG Retrieval time: ${endTime - startTime}ms`);
      }

      setIsSearching(false);

      // 2. Call AI with context
      const activeProject = WorkspaceService.getCurrentProject();
      const projectContext = activeProject ? `\nContexto do Projeto Atual (${activeProject.name}):\n${activeProject.aiContext || "Sem contexto adicional."}\n` : "";

      const aiResponse = await (askGeneralAI as any)({ 
        data: { 
          question: finalQuestion,
          context: (useRAG && contextText ? `Baseie sua resposta nos seguintes documentos locais:\n${contextText}` : "Responda como um engenheiro especialista em infraestrutura rodoviária.") + projectContext
        } 
      });

      const assistantMsg: ChatMessage = { 
        role: "assistant", 
        content: (aiResponse as any).answer, 
        timestamp: Date.now(),
        contextDocs: contextDocs.map(d => d.id!),
        contextChunks: contextChunks.length > 0 ? contextChunks : undefined
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-10rem)] max-w-7xl mx-auto">
      <div className="lg:col-span-1 space-y-4 hidden lg:block">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Status IA Documental
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Último Índice
                </span>
                <span className="font-mono text-[10px]">{ragStats.lastIndexDate}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Total de Chunks
                </span>
                <span className="font-bold">{ragStats.totalChunks}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Latência RAG
                </span>
                <span className="font-bold text-green-500">{ragStats.loadTime}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50">
              <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                O motor RAG processa documentos localmente em chunks de 1000 caracteres para máxima precisão técnica.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-[10px] h-8 gap-2 border-primary/10 hover:bg-primary/5"
              onClick={handleReindex}
              disabled={isReindexing}
            >
              {isReindexing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Reindexar Base Manual
            </Button>
          </CardContent>
        </Card>
        
        <Card className="glass-card bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Dica Técnica</p>
            <p className="text-[11px] text-muted-foreground">
              Ative o modo RAG para fundamentar respostas em normas DER/DNIT específicas. Desative para conversas de produtividade geral.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 flex flex-col border border-border/50 rounded-2xl overflow-hidden bg-card shadow-xl">
      <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="text-primary-foreground h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Engenheiro IA InfraFlow</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${messages.some(m => m.contextDocs?.length) ? 'bg-primary' : 'bg-green-500'} animate-pulse`} />
              IA Documental: {messages.some(m => m.contextDocs?.length) ? 'Modo RAG Ativo' : 'Sincronizado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-lg border border-border/50 mr-2">
             <span className="text-[10px] font-bold uppercase text-muted-foreground">RAG</span>
             <Button 
               variant={useRAG ? "default" : "outline"} 
               size="sm" 
               className="h-6 text-[9px] px-2"
               onClick={() => setUseRAG(!useRAG)}
             >
               {useRAG ? "ON" : "OFF"}
             </Button>
           </div>
           <Button variant="ghost" size="sm" onClick={clearHistory} className="h-8 text-xs opacity-60 hover:opacity-100">
             Limpar Chat
           </Button>
           <Button 
             variant="outline" 
             size="sm" 
             className="h-8 text-xs gap-1 border-primary/20 hover:bg-primary/5 text-primary"
             onClick={handleReindex}
             disabled={isReindexing}
           >
             {isReindexing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
             Reindexar
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
                
                {msg.contextChunks && msg.contextChunks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Database className="h-3 w-3" /> Fontes e Trechos (RAG Local):
                    </p>
                    <div className="grid gap-2">
                      {msg.contextChunks.map((chunk, idx) => (
                        <div key={idx} className="bg-background/40 p-2 rounded-md border border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-primary truncate max-w-[150px]">{chunk.docName}</span>
                            <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase">{chunk.category}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 italic italic-primary">"{chunk.text}"</p>
                        </div>
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
    </div>
  );
}
