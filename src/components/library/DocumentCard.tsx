import { FileText, MoreVertical, Download, Eye, Bot, Trash2, ListChecks, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Document {
  id: string;
  name: string;
  agency: string;
  category: string;
  file_path: string;
  created_at: string;
}

export function DocumentCard({ document }: { document: Document }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      // 1. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from("technical_docs")
        .remove([document.file_path]);
      
      if (storageError) throw storageError;

      // 2. Delete from DB
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);
      
      if (dbError) throw dbError;

      toast.success("Documento removido com sucesso");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error: any) {
      toast.error(`Erro ao remover: ${error.message}`);
    }
  };

  const handleDownload = async () => {
    const { data, error } = await supabase.storage
      .from("technical_docs")
      .download(document.file_path);
    
    if (error) {
      toast.error("Erro ao baixar arquivo");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = document.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="group overflow-hidden bg-muted/20 border-border/50 hover:bg-muted/30 hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <FileText className="h-6 w-6" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Resumo sendo gerado...", { description: "Em breve você poderá visualizar resumos automáticos." })}>
                <Sparkles className="mr-2 h-4 w-4" /> Gerar Resumo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Extraindo tópicos...", { description: "Funcionalidade em desenvolvimento." })}>
                <ListChecks className="mr-2 h-4 w-4" /> Tópicos Importantes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-lg line-clamp-1 mb-1">{document.name}</h3>
        <div className="flex gap-2 mb-3">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-[10px] uppercase">
            {document.agency}
          </Badge>
          <Badge variant="outline" className="bg-muted text-[10px] uppercase">
            {document.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Adicionado em {new Date(document.created_at).toLocaleDateString('pt-BR')}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1 text-xs h-8" onClick={() => window.open(supabase.storage.from("technical_docs").getPublicUrl(document.file_path).data.publicUrl, '_blank')}>
          <Eye className="mr-1 h-3 w-3" /> Visualizar
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
          <Bot className="mr-1 h-3 w-3" /> Perguntar
        </Button>
      </CardFooter>
    </Card>
  );
}
