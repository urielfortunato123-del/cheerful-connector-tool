import { Document } from "@/lib/db";
import { DocumentCard } from "./DocumentCard";
import { cn } from "@/lib/utils";

interface DocumentGridProps {
  documents: Document[];
  viewMode: "grid" | "list";
  onRefresh: () => void;
}

export function DocumentGrid({ documents, viewMode, onRefresh }: DocumentGridProps) {
  if (viewMode === "list") {
    return (
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Documento</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Categoria</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Órgão</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Tamanho</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} viewMode="list" onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} viewMode="grid" onRefresh={onRefresh} />
      ))}
    </div>
  );
}
