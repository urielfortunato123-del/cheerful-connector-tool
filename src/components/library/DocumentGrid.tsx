import { Document } from "@/lib/db";
import { DocumentCard } from "./DocumentCard";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface DocumentGridProps {
  documents: Document[];
  viewMode: "grid" | "list";
  onRefresh: () => void;
  onPreview?: (doc: Document) => void;
  onAsk?: (doc: Document) => void;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
}

export function DocumentGrid({ documents, viewMode, onRefresh, onPreview, onAsk, selectedIds = [], onToggleSelect }: DocumentGridProps) {
  if (viewMode === "list") {
    return (
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted-foreground w-12 text-center">
                <div 
                  className={cn(
                    "w-4 h-4 rounded border inline-flex items-center justify-center cursor-pointer transition-colors mx-auto",
                    selectedIds.length === documents.length && documents.length > 0 ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                  )}
                  onClick={() => {
                    if (selectedIds.length === documents.length) {
                      documents.forEach(d => onToggleSelect?.(d.id!));
                    } else {
                      const toAdd = documents.filter(d => !selectedIds.includes(d.id!));
                      toAdd.forEach(d => onToggleSelect?.(d.id!));
                    }
                  }}
                >
                  {selectedIds.length === documents.length && documents.length > 0 && <Check className="h-3 w-3" />}
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Documento</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Categoria</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Órgão</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Tamanho</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {documents.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                document={doc} 
                viewMode="list" 
                onRefresh={onRefresh} 
                onPreview={onPreview}
                onAsk={onAsk}
                isSelected={selectedIds.includes(doc.id!)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <DocumentCard 
          key={doc.id} 
          document={doc} 
          viewMode="grid" 
          onRefresh={onRefresh} 
          onPreview={onPreview}
          onAsk={onAsk}
          isSelected={selectedIds.includes(doc.id!)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
