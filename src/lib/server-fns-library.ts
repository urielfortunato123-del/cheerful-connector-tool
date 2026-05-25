import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askLibraryAI = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .handler(async (ctx: any) => {
    const { data, context } = ctx;
    const { supabase } = context;
    const question = (data as any)?.question || "";

    let contextText = "";

    try {
      const { data: docs } = await supabase
        .from("documents")
        .select("content_text, name")
        .limit(5);

      contextText =
        docs
          ?.map(
            (d: any) =>
              `Documento: ${d.name}\nConteúdo: ${d.content_text?.substring(0, 3000)}`,
          )
          .join("\n\n") || "";
    } catch (e) {
      console.error("Error fetching docs for context:", e);
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    console.log("Verificando OPENROUTER_API_KEY (Library):", OPENROUTER_API_KEY ? "Presente (protegido)" : "AUSENTE");

    if (!OPENROUTER_API_KEY) {
      return { answer: "⚠️ Erro de Configuração: A chave OPENROUTER_API_KEY não foi encontrada nas variáveis de ambiente do projeto." };
    }

    const systemPrompt = `Você é o assistente técnico especializado da InfraFlow, expert em infraestrutura brasileira (DER, DNIT, etc).
Use o contexto técnico abaixo para responder à pergunta do usuário de forma extremamente precisa e profissional.

DIRETRIZES:
1. Use termos técnicos adequados (normas, especificações, etc).
2. Se a resposta estiver nos documentos, cite qual documento ou órgão (se disponível no contexto).
3. Se a informação não estiver no contexto, seja honesto e diga que não encontrou nos manuais carregados, mas pode oferecer conhecimento geral de engenharia se solicitado.
4. Responda em Português do Brasil.

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

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        if (response.status === 429) {
          return { answer: "⚠️ Limite de requisições atingido. Aguarde alguns instantes." };
        }
        if (response.status === 402) {
          return { answer: "⚠️ Créditos de IA esgotados. Adicione créditos no workspace Lovable." };
        }
        console.error("AI gateway error:", response.status, text);
        return { answer: "⚠️ Serviço de IA temporariamente indisponível." };
      }

      const result = await response.json();
      const answer = result?.choices?.[0]?.message?.content ?? "Sem resposta.";
      return { answer };
    } catch (err) {
      console.error("askLibraryAI error:", err);
      return { answer: "⚠️ Erro inesperado ao consultar a IA." };
    }
  });
