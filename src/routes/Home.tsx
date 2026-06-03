import { useNavigate } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { User, Users, MapPin, Phone } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003366] to-[#3399CC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[#3399CC]/30 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 text-center relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 rotate-3">
             <span className="text-4xl font-black text-[#003366]">AS</span>
          </div>
          <h2 className="text-white font-black text-3xl tracking-tighter uppercase italic">
            Acqua Soft
          </h2>
          <p className="text-blue-100 font-bold tracking-widest text-xs uppercase opacity-80">
            Purificadores de Água
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl space-y-8 border border-white/20">
          <h1 className="text-2xl font-black text-[#003366] leading-tight">
            Como podemos ajudar você hoje?
          </h1>
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              size="lg" 
              className="w-full h-24 text-xl bg-[#003366] hover:bg-[#002244] rounded-2xl shadow-lg hover:shadow-xl transition-all group overflow-hidden relative"
              onClick={() => navigate({ to: '/atendimento', search: { isClient: true } })}
            >
              <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
              <User className="mr-3 h-8 w-8" /> 
              <span className="relative font-black uppercase tracking-tight">Sou Cliente</span>
            </Button>
            
            <Button 
              size="lg" 
              className="w-full h-24 text-xl bg-[#3399CC] hover:bg-[#2288BB] rounded-2xl shadow-lg hover:shadow-xl transition-all group overflow-hidden relative"
              onClick={() => navigate({ to: '/atendimento', search: { isClient: false } })}
            >
              <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
              <Users className="mr-3 h-8 w-8" /> 
              <span className="relative font-black uppercase tracking-tight">Não Sou Cliente</span>
            </Button>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <div className="flex flex-col items-center text-white/90 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Phone size={14} className="text-blue-200" />
              (14) 98120-0302
            </div>
            <div className="flex items-center gap-2 text-[10px] font-medium opacity-70 uppercase tracking-widest max-w-[250px]">
              <MapPin size={12} className="shrink-0" />
              Rua Tenente Lopes, 1175 - Jaú/SP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
