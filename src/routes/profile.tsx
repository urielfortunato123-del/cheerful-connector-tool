import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
      <HardHat className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className="text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">Módulo em desenvolvimento técnico.</p>
    </div>
  </div>
);

export const Route = createFileRoute("/profile")({ component: () => <Placeholder title="Perfil" /> });
