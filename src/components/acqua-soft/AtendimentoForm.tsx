import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateWhatsAppMessage } from "@/lib/whatsapp";

const formSchema = z.object({
  customer_name: z.string().min(3),
  customer_phone: z.string().min(10),
  city: z.string().min(2),
  neighborhood: z.string().min(2),
  address: z.string().min(5),
  request_type: z.enum(['orcamento', 'troca_refil', 'suporte_tecnico', 'manutencao_preventiva']),
  purifier_model: z.string().optional(),
  property_type: z.string().optional(),
});

export function AtendimentoForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const { data: result, error } = await supabase
        .from('service_requests')
        .insert([data])
        .select();

      if (error) throw error;

      const message = generateWhatsAppMessage({ ...data });
      window.open(`https://wa.me/5514981200302?text=${message}`, '_blank');
      toast.success("Solicitação enviada!");
    } catch (e) {
      toast.error("Erro ao enviar solicitação.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label>Nome Completo</Label>
        <Input {...form.register("customer_name")} />
      </div>
      <div className="grid gap-2">
        <Label>Telefone</Label>
        <Input {...form.register("customer_phone")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Cidade</Label>
          <Input {...form.register("city")} />
        </div>
        <div className="grid gap-2">
          <Label>Bairro</Label>
          <Input {...form.register("neighborhood")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Endereço</Label>
        <Input {...form.register("address")} />
      </div>

      <Button type="submit" className="w-full bg-[#003366] hover:bg-[#004080] h-12 text-lg font-bold mt-6">
        Enviar Atendimento
      </Button>
    </form>
  );
}
