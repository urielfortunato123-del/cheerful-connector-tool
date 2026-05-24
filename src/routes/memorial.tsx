import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";

export const Route = createFileRoute("/memorial")({
  component: () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Memorial Descritivo</h1>
        <Button>
          <FileEdit className="mr-2 h-4 w-4" /> Gerar Novo Memorial
        </Button>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Utilize a IA para gerar memoriais descritivos baseados em normas técnicas.
      </div>
    </div>
  ),
});
