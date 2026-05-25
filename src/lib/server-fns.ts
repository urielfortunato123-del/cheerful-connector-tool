import { createServerFn } from "@tanstack/react-start";

export const askGeneralAI = createServerFn({
  method: "POST",
})
  .handler(async (ctx: any) => {
    const data = ctx.data as { question: string; context?: string };
    const question = data?.question || "";
    const extraContext = data?.context || "";

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    console.log("Verificando OPENROUTER_API_KEY:", OPENROUTER_API_KEY ? "Presente (protegido)" : "AUSENTE");
    
    if (!OPENROUTER_API_KEY) {
      return { answer: "⚠️ Erro de Configuração: A chave OPENROUTER_API_KEY não foi encontrada nas variáveis de ambiente do projeto." };
    }

    const systemPrompt = `Você é o Assistente Global da InfraFlow, um sistema premium de infraestrutura rodoviária brasileira.
Seu objetivo é auxiliar em todas as camadas do programa: engenharia, financeiro, medições e normas.

DIRETRIZES:
1. Responda de forma executiva, técnica e precisa.
2. Se o usuário estiver em um contexto específico (ex: medições), foque suas respostas nesse tema.
3. Use o conhecimento das normas DNIT e DER para fundamentar suas respostas.
4. Se solicitado cálculos, explique a memória de cálculo.

${extraContext ? `CONTEXTO ATUAL DA PÁGINA: ${extraContext}` : ""}`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://lovable.dev", // Opcional, mas recomendado pela OpenRouter
          "X-Title": "InfraFlow",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        if (response.status === 429) {
          return { answer: "⚠️ Limite de requisições atingido. Aguarde alguns instantes e tente novamente." };
        }
        if (response.status === 402) {
          return { answer: "⚠️ Créditos de IA esgotados. Adicione créditos no workspace Lovable." };
        }
        console.error("AI gateway error:", response.status, text);
        return { answer: "⚠️ Serviço de IA temporariamente indisponível. Tente novamente em instantes." };
      }

      const result = await response.json();
      const answer = result?.choices?.[0]?.message?.content ?? "Sem resposta.";
      return { answer };
    } catch (err) {
      console.error("askGeneralAI error:", err);
      return { answer: "⚠️ Erro inesperado ao consultar a IA. Tente novamente." };
    }
  });

export { askLibraryAI } from "./server-fns-library";
