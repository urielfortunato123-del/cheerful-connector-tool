import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/standards")({
  component: () => (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Normas Técnicas</h1>
        <p className="text-muted-foreground text-lg">Repositório oficial de normas DNIT, DER e ABNT.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por código ou título (ex: DNIT 141)" className="pl-10" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["Normas DNIT", "Manuais DER", "Normas ABNT"].map((category) => (
          <div key={category} className="rounded-xl border bg-card p-6 hover:border-primary/50 cursor-pointer transition-all">
            <h3 className="font-semibold">{category}</h3>
            <p className="text-sm text-muted-foreground">Clique para explorar documentos.</p>
          </div>
        ))}
      </div>
    </div>
  ),
});
