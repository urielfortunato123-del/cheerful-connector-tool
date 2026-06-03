import { useNavigate } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Users } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003366] to-[#3399CC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold text-[#003366] mb-6">Como podemos ajudar você hoje?</h1>
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              size="lg" 
              className="w-full h-20 text-lg bg-[#003366] hover:bg-[#004080]"
              onClick={() => navigate({ to: '/atendimento', search: { isClient: true } })}
            >
              <User className="mr-2 h-6 w-6" /> Sou Cliente
            </Button>
            <Button 
              size="lg" 
              className="w-full h-20 text-lg bg-[#3399CC] hover:bg-[#4da3d6]"
              onClick={() => navigate({ to: '/atendimento', search: { isClient: false } })}
            >
              <Users className="mr-2 h-6 w-6" /> Não Sou Cliente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
