import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/measurements")({
  component: () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Medições</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Medição
        </Button>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Nenhuma medição registrada para o período.
      </div>
    </div>
  ),
});
