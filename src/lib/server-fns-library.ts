import { createServerFn } from "@tanstack/react-start";

export const askLibraryAI = createServerFn({
  method: "POST",
})
  .handler(async (ctx: any) => {
    const data = ctx.data as { question: string; context?: string };
    const question = data?.question || "";
    const contextText = data?.context || "";

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      return { answer: "⚠️ Erro de Configuração: A chave OPENROUTER_API_KEY não foi encontrada." };
    }

    const systemPrompt = `Você é o assistente técnico especializado da InfraFlow, expert em infraestrutura brasileira (DER-SP, DNIT, ABNT).
Use o contexto técnico abaixo para responder à pergunta do usuário de forma extremamente precisa e profissional.

DIRETRIZES:
1. Use termos técnicos adequados (normas, especificações, etc).
2. Se a resposta estiver nos documentos, cite qual documento ou órgão.
3. Se a informação não estiver no contexto, use seu conhecimento geral mas avise.
4. Responda em Português do Brasil.
5. Sugira vínculos com outros módulos do InfraFlow quando relevante:
    - Para Orçamentos: sugira composições técnicas ou ETs relacionadas.
    - Para Memorial: sugira textos normativos para fundamentação.
    - Para Medições: sugira critérios de aceitação e medição técnica.
    - Para Mapa GIS: sugira vinculação da norma ao trecho da rodovia.

Contexto dos Documentos Técnicos:
${contextText}`;

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

      if (response.ok) {
        const result = await response.json();
        const answer = result?.choices?.[0]?.message?.content ?? "Sem resposta.";
        return { answer };
      }
      
      if (response.status === 401) {
        return { answer: "⚠️ Erro de Autenticação: A chave OPENROUTER_API_KEY é inválida." };
      }
      
      if (response.status === 402) {
        return { answer: "⚠️ Créditos de IA esgotados na OpenRouter." };
      }
      
      return { answer: `⚠️ Serviço de IA temporariamente indisponível (Status ${response.status}).` };
    } catch (err) {
      console.error(err);
      return { answer: "⚠️ Erro ao consultar a biblioteca via IA." };
    }
  });
