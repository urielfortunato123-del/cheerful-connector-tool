import { 
  FileText, 
  FileSpreadsheet, 
  FileIcon, 
  Download, 
  Eye, 
  Bot, 
  Trash2, 
  Star, 
  CheckCircle2,
  Clock,
  MoreVertical,
  Sparkles,
  Check
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { db, Document } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentCardProps {
  document: Document;
  viewMode: "grid" | "list";
  onRefresh: () => void;
  onPreview?: (doc: Document) => void;
  onAsk?: (doc: Document) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export function DocumentCard({ document, viewMode, onRefresh, onPreview, onAsk, isSelected, onToggleSelect }: DocumentCardProps) {
  const isPDF = document.tipo === 'pdf';
  const isExcel = ['xlsx', 'xls', 'csv'].includes(document.tipo);

  const getFileIcon = () => {
    if (isPDF) return <FileText className="h-5 w-5 text-red-500" />;
    if (isExcel) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    return <FileIcon className="h-5 w-5 text-blue-500" />;
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${document.nome}"?`)) return;
    try {
      await db.documents.delete(document.id!);
      toast.success("Documento removido da base local.");
      onRefresh();
    } catch (error) {
      toast.error("Erro ao remover documento.");
    }
  };

  const handleRename = async () => {
    const newName = prompt("Novo nome para o documento:", document.nome);
    if (newName && newName !== document.nome) {
      try {
        await db.documents.update(document.id!, { nome: newName });
        toast.success("Documento renomeado.");
        onRefresh();
      } catch (error) {
        toast.error("Erro ao renomear.");
      }
    }
  };

  const toggleFavorite = async () => {
    try {
      await db.documents.update(document.id!, { favorito: !document.favorito });
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = () => {
    if (!document.fileBlob) {
        toast.error("Blob do arquivo não encontrado.");
        return;
    }
    const url = URL.createObjectURL(document.fileBlob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = document.nome;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (viewMode === "list") {
    return (
      <tr className={cn(
        "hover:bg-muted/30 transition-colors group",
        isSelected && "bg-primary/5"
      )}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors",
                isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground/30 hover:border-primary/50"
              )}
              onClick={() => onToggleSelect?.(document.id!)}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </div>
            <div className="p-2 bg-muted rounded-md group-hover:bg-background transition-colors">
              {getFileIcon()}
            </div>
            <div>
              <p className="font-semibold text-sm line-clamp-1">{document.nome}</p>
              <div className="flex items-center gap-2 mt-0.5 md:hidden">
                 <Badge variant="outline" className="text-[9px] h-4 py-0 uppercase">{document.orgao}</Badge>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
           <Badge variant="secondary" className="text-[10px] h-5">{document.categoria}</Badge>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell text-xs font-medium text-muted-foreground uppercase">
          {document.orgao}
        </td>
        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
          {document.tamanho}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", document.favorito && "text-amber-500")}
              onClick={toggleFavorite}
            >
              <Star className={cn("h-4 w-4", document.favorito && "fill-current")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={() => onPreview?.(document)}>
                  <Eye className="h-4 w-4" /> Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => onAsk?.(document)}>
                  <Bot className="h-4 w-4" /> Analisar com IA
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleRename}>
                  <Sparkles className="h-4 w-4" /> Renomear
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <Card className={cn(
      "group overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-300 bg-card relative",
      isSelected && "ring-2 ring-primary ring-inset border-primary/50"
    )}>
      <div 
        className={cn(
          "absolute top-2 left-2 z-10 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all",
          isSelected ? "bg-primary border-primary text-white opacity-100" : "bg-background/80 border-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:border-primary/50"
        )}
        onClick={() => onToggleSelect?.(document.id!)}
      >
        {isSelected && <Check className="h-3.5 w-3.5" />}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
            isPDF ? "bg-red-50 text-red-500" : isExcel ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
          )}>
            {getFileIcon()}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-full", document.favorito && "text-amber-500 bg-amber-50")}
              onClick={toggleFavorite}
            >
              <Star className={cn("h-3.5 w-3.5", document.favorito && "fill-current")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={() => onPreview?.(document)}>
                  <Download className="h-4 w-4" /> Visualizar Interno
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => onAsk?.(document)}>
                  <Sparkles className="h-4 w-4 text-primary" /> Gerar Resumo IA
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleRename}>
                  <Sparkles className="h-4 w-4" /> Renomear
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] leading-tight mb-2 group-hover:text-primary transition-colors">
          {document.nome}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="bg-muted/50 border-none text-[9px] h-4 py-0 uppercase tracking-tighter">
            {document.orgao}
          </Badge>
          <Badge variant="secondary" className="text-[9px] h-4 py-0 bg-primary/5 text-primary border-none">
            {document.categoria}
          </Badge>
          {document.indexed && (
             <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[9px] h-4 py-0 gap-1">
                <CheckCircle2 className="h-2 w-2" /> IA READY
             </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto pt-2 border-t border-dashed">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(document.dataUpload, 'dd MMM yyyy', { locale: ptBR })}
          </div>
          <span className="font-medium">{document.tamanho}</span>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/30 border-t flex gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 h-7 text-[10px] font-bold gap-1 hover:bg-background"
          onClick={() => onPreview?.(document)}
        >
          <Eye className="h-3 w-3" /> VER
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 h-7 text-[10px] font-bold gap-1 text-primary hover:bg-primary/5"
          onClick={() => onAsk?.(document)}
        >
          <Bot className="h-3 w-3" /> IA
        </Button>
      </CardFooter>
    </Card>
  );
}
