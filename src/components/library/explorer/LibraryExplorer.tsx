import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Search } from "lucide-react";
import { LIBRARY_HIERARCHY, LibraryCategory } from "../constants";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface LibraryExplorerProps {
  onCategorySelect: (category: string, hierarchy: string[]) => void;
  selectedCategory?: string;
}

export function LibraryExplorer({ onCategorySelect, selectedCategory }: LibraryExplorerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'der-sp-tecnicas': true,
  });
  const [filter, setFilter] = useState("");

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategory = (category: LibraryCategory, path: string[] = []) => {
    const isExpanded = expanded[category.id];
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategory === category.id;
    const currentPath = [...path, category.label];

    if (filter && !category.label.toLowerCase().includes(filter.toLowerCase()) && !category.children?.some(c => c.label.toLowerCase().includes(filter.toLowerCase()))) {
        return null;
    }

    return (
      <div key={category.id} className="ml-2">
        <div 
          className={cn(
            "flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors",
            isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => {
            if (hasChildren) toggleExpand(category.id);
            onCategorySelect(category.id, currentPath);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <div className="w-4" />
          )}
          {isExpanded ? <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" /> : <Folder className="h-4 w-4 shrink-0 text-amber-500" />}
          <span className="truncate">{category.label}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2 border-l border-border mt-1 space-y-0.5">
            {category.children!.map(child => renderCategory(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Navegação Técnica</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Filtrar categorias..." 
            className="pl-8 h-8 text-xs bg-background"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {LIBRARY_HIERARCHY.map(cat => renderCategory(cat))}
      </div>
    </div>
  );
}
