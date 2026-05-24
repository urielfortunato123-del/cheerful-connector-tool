import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askLibraryAI = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: { data: any, context: any }) => {
    const { supabase } = context;
    const question = (data as any)?.question || (typeof data === 'string' ? data : '');

    let contextText = "";
    
    // Simple search for context
    const { data: docs } = await supabase
      .from("documents")
      .select("content_text, name")
      .limit(5);
    
    contextText = docs?.map((d: any) => `Documento: ${d.name}\nConteúdo: ${d.content_text?.substring(0, 3000)}`).join("\n\n") || "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é o assistente técnico da InfraFlow. Use o contexto abaixo para responder à pergunta do usuário. 
            Responda de forma técnica, profissional e baseada estritamente nos documentos fornecidos.
            Se a resposta não estiver no contexto, informe que não encontrou essa informação nos documentos carregados.
            
            Contexto:
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
      throw new Error(`AI Gateway error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return { answer: result.choices[0].message.content };
  });
