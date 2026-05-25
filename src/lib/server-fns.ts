import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askGeneralAI = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }: { data: { question: string, context?: string } }) => {
    const question = data?.question || "";
    const extraContext = data?.context || "";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "InfraFlow AI Assistant",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash:free",
        messages: [
          {
            role: "system",
            content: `Você é o Assistente Global da InfraFlow, um sistema premium de infraestrutura rodoviária brasileira.
            Seu objetivo é auxiliar em todas as camadas do programa: engenharia, financeiro, medições e normas.
            
            DIRETRIZES:
            1. Responda de forma executiva, técnica e precisa.
            2. Se o usuário estiver em um contexto específico (ex: medições), foque suas respostas nesse tema.
            3. Use o conhecimento das normas DNIT e DER para fundamentar suas respostas.
            4. Se solicitado cálculos, explique a memória de cálculo.
            
            ${extraContext ? `CONTEXTO ATUAL DA PÁGINA: ${extraContext}` : ""}`,
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

export { askLibraryAI } from "./server-fns-library";
