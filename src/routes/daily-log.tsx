import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/daily-log")({
  component: () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Diário de Obra</h1>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" /> Selecionar Data
        </Button>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Selecione um projeto e uma data para visualizar ou criar o diário.
      </div>
    </div>
  ),
});
