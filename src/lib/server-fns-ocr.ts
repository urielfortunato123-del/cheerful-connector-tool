import { createServerFn } from "@tanstack/react-start";

export const performOCR = createServerFn({
  method: "POST",
})
  .validator((data: { base64Image: string; language?: string; isPDF?: boolean }) => data)
  .handler(async ({ data }) => {
    const base64Image = data?.base64Image || "";
    const language = data?.language || "por"; 
    const isPDF = data?.isPDF || false;

    const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY;
    
    if (!OCR_SPACE_API_KEY) {
      console.error("OCR_SPACE_API_KEY is missing");
      return { error: "Configuração ausente: OCR_SPACE_API_KEY não encontrada." };
    }

    try {
      const formData = new URLSearchParams();
      formData.append("apikey", OCR_SPACE_API_KEY);
      formData.append("language", language);
      formData.append("isOverlayRequired", "false");
      formData.append("base64Image", base64Image);
      if (isPDF) {
        formData.append("isTable", "true"); 
      }

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR.space API error:", response.status, errorText);
        return { error: `Erro na API de OCR: ${response.status}` };
      }

      const result = await response.json();
      
      if (result.IsErroredOnProcessing) {
        console.error("OCR.space processing error:", result.ErrorMessage);
        return { error: `Erro no processamento: ${result.ErrorMessage.join(", ")}` };
      }

      const parsedText = result.ParsedResults?.map((res: any) => res.ParsedText).join("\n") || "";
      
      return { text: parsedText };
    } catch (err) {
      console.error("OCR Exception:", err);
      return { error: "Falha na comunicação com o serviço de OCR." };
    }
  });
