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

    const maxRetries = 3;
    let retryCount = 0;
    let lastError = "";

    while (retryCount <= maxRetries) {
      const requestId = Math.random().toString(36).substring(7);
      const startTime = Date.now();
      
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://lovable.dev",
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

        const duration = Date.now() - startTime;
        console.log(`[OpenRouter][${requestId}] Status: ${response.status} | Tempo: ${duration}ms | Tentativa: ${retryCount + 1}`);

        if (response.ok) {
          const result = await response.json();
          const answer = result?.choices?.[0]?.message?.content ?? "Sem resposta.";
          return { answer };
        }

        if (response.status === 429 && retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`[OpenRouter][${requestId}] Rate Limit (429). Retry em ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        const text = await response.text().catch(() => "");
        if (response.status === 429) {
          return { answer: "⚠️ Limite de requisições atingido na OpenRouter. Por favor, aguarde um momento." };
        }
        if (response.status === 402) {
          return { answer: "⚠️ Créditos de IA esgotados na OpenRouter." };
        }
        
        console.error(`[OpenRouter][${requestId}] Erro detalhado:`, response.status, text);
        return { answer: "⚠️ Serviço de IA temporariamente indisponível." };
      } catch (err) {
        const duration = Date.now() - startTime;
        lastError = String(err);
        console.error(`[OpenRouter][${requestId}] Exceção:`, lastError, `| Tempo: ${duration}ms`);
        
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    console.error("askGeneralAI max retries reached:", lastError);
    return { answer: "⚠️ Erro ao consultar a IA após várias tentativas." };
  });

export { askLibraryAI } from "./server-fns-library";
