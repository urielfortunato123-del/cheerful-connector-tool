import { createServerFn } from "@tanstack/react-start";

export const askLibraryAI = createServerFn({
  method: "POST",
})
.handler(async (args) => {
  const data = args as unknown as { question: string; documentId?: string };
  
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
          Responda de forma técnica, profissional e baseada estritamente nos documentos fornecidos.`,
        },
        {
          role: "user",
          content: data.question,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`AI Gateway error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  return { answer: result.choices[0].message.content };
});
