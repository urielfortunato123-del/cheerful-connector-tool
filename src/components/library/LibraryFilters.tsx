import { useState } from "react";
import { Filter, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";

interface LibraryFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: any) => void;
  agencies: string[];
  categories: string[];
}

export function LibraryFilters({ onSearch, onFilterChange, agencies, categories }: LibraryFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const toggleAgency = (agency: string) => {
    const next = selectedAgencies.includes(agency)
      ? selectedAgencies.filter(a => a !== agency)
      : [...selectedAgencies, agency];
    setSelectedAgencies(next);
    onFilterChange({ agencies: next, categories: selectedCategories });
  };

  const toggleCategory = (category: string) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(next);
    onFilterChange({ agencies: selectedAgencies, categories: next });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAgencies([]);
    setSelectedCategories([]);
    onSearch("");
    onFilterChange({ agencies: [], categories: [] });
  };

  const hasActiveFilters = searchTerm !== "" || selectedAgencies.length > 0 || selectedCategories.length > 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 p-2 bg-muted/30 rounded-lg mb-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar na biblioteca..." 
          className="pl-9 bg-background h-10 border-none shadow-sm"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button 
            onClick={() => { setSearchTerm(""); onSearch(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-10 bg-background border-none shadow-sm flex-1 md:flex-none">
              <Filter className="h-4 w-4" /> Órgão {selectedAgencies.length > 0 && `(${selectedAgencies.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtrar por Órgão</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {agencies.map(agency => (
              <DropdownMenuCheckboxItem
                key={agency}
                checked={selectedAgencies.includes(agency)}
                onCheckedChange={() => toggleAgency(agency)}
              >
                {agency}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-10 bg-background border-none shadow-sm flex-1 md:flex-none">
              <Filter className="h-4 w-4" /> Categoria {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map(cat => (
              <DropdownMenuCheckboxItem
                key={cat}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              >
                {cat}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-destructive">
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
