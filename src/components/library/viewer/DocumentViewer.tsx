import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Maximize2, X } from "lucide-react";
import { Document } from "@/lib/db";

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!document) return null;

  const fileUrl = document.fileBlob ? URL.createObjectURL(document.fileBlob) : null;
  const isPDF = document.tipo === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(document.tipo);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-card",
        isFullscreen && "max-w-none w-screen h-screen rounded-none border-none"
      )}>
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded">
                <FileText className="h-5 w-5 text-primary" />
             </div>
             <div>
                <DialogTitle className="text-sm font-bold truncate max-w-md">{document.nome}</DialogTitle>
                <p className="text-[10px] text-muted-foreground uppercase">{document.orgao} • {document.categoria} • {document.tamanho}</p>
             </div>
          </div>
          <div className="flex items-center gap-2 pr-8">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                if (fileUrl) {
                    const a = window.document.createElement("a");
                    a.href = fileUrl;
                    a.download = document.nome;
                    a.click();
                }
            }}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            {fileUrl && (
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 bg-muted/20 relative overflow-hidden">
          {isPDF && fileUrl ? (
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-none"
              title={document.nome}
            />
          ) : isImage && fileUrl ? (
            <div className="w-full h-full flex items-center justify-center p-4">
                <img src={fileUrl} alt={document.nome} className="max-w-full max-h-full object-contain shadow-lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <div className="p-6 bg-muted rounded-full">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Visualização não disponível para este formato</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Formatos como Excel, Word e ZIP precisam ser baixados para visualização no seu computador.
                </p>
              </div>
              <Button className="gap-2" onClick={() => fileUrl && window.open(fileUrl)}>
                <Download className="h-4 w-4" /> Baixar Documento
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { cn } from "@/lib/utils";
import { FileIcon, FileText } from "lucide-react";
