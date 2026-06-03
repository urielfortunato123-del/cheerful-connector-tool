import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card } from "@/components/ui/card";
import { AtendimentoForm } from "@/components/acqua-soft/AtendimentoForm";
import { Calculator, RefreshCw, Wrench, ShieldCheck, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute('/atendimento')({
  component: Atendimento,
});

type ServiceType = 'orcamento' | 'troca_refil' | 'suporte_tecnico' | 'manutencao_preventiva' | null;

function Atendimento() {
  const [serviceType, setServiceType] = useState<ServiceType>(null);
  const { isClient } = Route.useSearch();
  const navigate = useNavigate();

  const services = [
    { id: 'orcamento', title: 'Solicitar Orçamento', icon: Calculator, color: 'bg-blue-500' },
    { id: 'troca_refil', title: 'Troca de Refil', icon: RefreshCw, color: 'bg-green-500' },
    { id: 'suporte_tecnico', title: 'Suporte Técnico', icon: Wrench, color: 'bg-orange-500' },
    { id: 'manutencao_preventiva', title: 'Manutenção Preventiva', icon: ShieldCheck, color: 'bg-indigo-500' },
  ];

  if (!serviceType) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] p-4 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4 text-[#003366]">
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          
          <h1 className="text-2xl font-black text-[#003366] mb-8 text-center uppercase tracking-tight">
            Selecione o Atendimento
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <Card 
                key={s.id} 
                className="p-6 cursor-pointer hover:shadow-xl transition-all border-none flex flex-col items-center text-center space-y-4 group"
                onClick={() => setServiceType(s.id as ServiceType)}
              >
                <div className={`p-4 rounded-2xl ${s.color} text-white group-hover:scale-110 transition-transform`}>
                  <s.icon size={32} />
                </div>
                <h3 className="font-bold text-lg text-[#003366]">{s.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => setServiceType(null)} className="mb-4 text-[#003366]">
          <ChevronLeft className="mr-2 h-4 w-4" /> Alterar Tipo
        </Button>
        
        <Card className="p-6 md:p-8 border-none shadow-lg bg-white rounded-3xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tight">
              {services.find(s => s.id === serviceType)?.title}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isClient ? 'Identificado como Cliente' : 'Novo Cliente'}
            </p>
          </div>
          <AtendimentoForm serviceType={serviceType} isClient={isClient} />
        </Card>
      </div>
    </div>
  );
}
