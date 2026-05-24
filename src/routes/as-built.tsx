import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

export const Route = createFileRoute("/as-built")({
  component: () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">As-Built</h1>
        <Button>
          <FileUp className="mr-2 h-4 w-4" /> Upload Documentação
        </Button>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Nenhum registro de "Como Construído" disponível para este projeto.
      </div>
    </div>
  ),
});
