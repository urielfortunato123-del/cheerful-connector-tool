import { createFileRoute } from '@tanstack/react-router';
import { Card } from "@/components/ui/card";
import { AtendimentoForm } from "@/components/acqua-soft/AtendimentoForm";

export const Route = createFileRoute('/atendimento')({
  component: Atendimento,
});

function Atendimento() {
  return (
    <div className="min-h-screen bg-[#F0F9FF] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 md:p-8 border-none shadow-lg bg-white rounded-3xl">
          <h1 className="text-2xl font-black text-[#003366] mb-6 text-center uppercase tracking-tight">
            Acqua Soft Atendimento
          </h1>
          <AtendimentoForm />
        </Card>
      </div>
    </div>
  );
}
