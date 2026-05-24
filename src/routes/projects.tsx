import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/projects")({
  component: () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Projeto
        </Button>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Nenhum projeto cadastrado. Comece criando o primeiro.
      </div>
    </div>
  ),
});
