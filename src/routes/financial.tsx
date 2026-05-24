import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Route = createFileRoute("/financial")({
  component: () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar Relatório
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {["Total Orçado", "Total Gasto", "Saldo"].map((label) => (
          <div key={label} className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">R$ 0,00</p>
          </div>
        ))}
      </div>
    </div>
  ),
});
