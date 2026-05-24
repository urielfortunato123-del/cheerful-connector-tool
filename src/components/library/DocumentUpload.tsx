import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromPdf } from "@/lib/pdf";
import { motion, AnimatePresence } from "framer-motion";

const agencies = ["DER", "DNIT", "Prefeituras", "Concessionárias"];
const categories = [
  "Técnicas", "Projetos", "Manuais", "Conservação", 
  "Pavimentação", "Geotecnia", "Sinalização", "Drenagem", "Obras de Arte"
];

export function DocumentUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [agency, setAgency] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Por favor, selecione apenas arquivos PDF.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !agency || !category) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Extract text from PDF
      setUploadProgress(30);
      const text = await extractTextFromPdf(file);
      
      // 2. Upload file to Storage
      setUploadProgress(50);
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("technical_docs")
        .upload(filePath, file);

      if (storageError) throw storageError;

      // 3. Save metadata to Database
      setUploadProgress(80);
      const { error: dbError } = await supabase.from("documents").insert({
        name: file.name,
        file_path: filePath,
        agency,
        category,
        content_text: text,
        user_id: user.id
      });

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast.success("Documento enviado e processado com sucesso!");
      onUploadSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="border-dashed border-2 bg-muted/20 border-border/50 overflow-hidden">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div 
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="hidden" 
            />
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {file ? file.name : "Arraste ou clique para upload"}
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              PDFs técnicos do DER, DNIT, etc. (Máx 50MB)
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Órgão / Instituição</label>
              <Select value={agency} onValueChange={setAgency}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria Técnica</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full mt-4 h-11" 
              disabled={isUploading || !file}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando {uploadProgress}%
                </>
              ) : (
                "Finalizar e Indexar"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
