import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askLibraryAI = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: { data: { question: string }, context: any }) => {
    const { supabase } = context;
    const question = data?.question || "";

    let contextText = "";
    
    try {
      const { data: docs } = await supabase
        .from("documents")
        .select("content_text, name")
        .limit(5);
      
      contextText = docs?.map((d: any) => `Documento: ${d.name}\nConteúdo: ${d.content_text?.substring(0, 3000)}`).join("\n\n") || "";
    } catch (e) {
      console.error("Error fetching docs for context:", e);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "InfraFlow Biblioteca Técnica",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash:free",
        messages: [
          {
            role: "system",
            content: `Você é o assistente técnico especializado da InfraFlow, expert em infraestrutura brasileira (DER, DNIT, etc). 
            Use o contexto técnico abaixo para responder à pergunta do usuário de forma extremamente precisa e profissional.
            
            DIRETRIZES:
            1. Use termos técnicos adequados (normas, especificações, etc).
            2. Se a resposta estiver nos documentos, cite qual documento ou órgão (se disponível no contexto).
            3. Se a informação não estiver no contexto, seja honesto e diga que não encontrou nos manuais carregados, mas pode oferecer conhecimento geral de engenharia se solicitado.
            4. Responda em Português do Brasil.
            
            Contexto dos Documentos Técnicos:
            ${contextText}`,
          },
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return { answer: result.choices[0].message.content };
  });
