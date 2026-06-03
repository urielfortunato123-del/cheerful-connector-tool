import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateWhatsAppMessage } from "@/lib/whatsapp";
import { LocationCapture } from "./LocationCapture";
import { MediaUpload } from "./MediaUpload";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  customer_name: z.string().min(3, "Nome muito curto"),
  customer_phone: z.string().min(10, "Telefone inválido"),
  city: z.string().min(2, "Cidade obrigatória"),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  address: z.string().min(5, "Endereço completo"),
  request_type: z.string(),
  is_client: z.boolean().default(false),
  
  // Property details
  property_type: z.enum(['casa', 'apartamento', 'comercial']).optional(),
  floor: z.string().optional(),
  has_elevator: z.boolean().optional(),
  has_high_pressure_tank: z.boolean().optional(),
  
  // Equipment details
  purifier_model: z.string().optional(),
  other_model: z.string().optional(),
  
  // Service specific
  problem_type: z.string().optional(),
  problem_description: z.string().optional(),
  last_maintenance: z.string().optional(),
  bought_before: z.boolean().optional(),
  observations: z.string().optional(),
  
  // Technical/Internal
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  google_maps_link: z.string().optional(),
  media_urls: z.array(z.string()).default([]),
});

interface AtendimentoFormProps {
  serviceType: 'orcamento' | 'troca_refil' | 'suporte_tecnico' | 'manutencao_preventiva';
  isClient: boolean;
}

export function AtendimentoForm({ serviceType, isClient }: AtendimentoFormProps) {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request_type: serviceType,
      is_client: isClient,
      media_urls: [],
      property_type: null,
      purifier_model: null,
      problem_type: null,
      bought_before: null,
      last_maintenance: null,
    }
  });

  useEffect(() => {
    // Reset form values when serviceType or isClient changes
    form.reset({
      ...form.getValues(),
      request_type: serviceType,
      is_client: isClient,
    });
  }, [serviceType, isClient, form]);

  useEffect(() => {
    const fetchModels = async () => {
      const { data } = await supabase.from('purifier_models').select('name').order('name');
      if (data) setModels(data.map(m => m.name));
    };
    fetchModels();
  }, []);

  const onSubmit = async (data: FormValues) => {

    setLoading(true);
    try {
      // Cleanup data based on type
      if (data.property_type !== 'apartamento') {
        data.floor = undefined;
        data.has_elevator = undefined;
      }

      const { error } = await supabase
        .from('service_requests')
        .insert([data]);

      if (error) throw error;

      const message = generateWhatsAppMessage(data);
      window.open(`https://wa.me/5514981200302?text=${message}`, '_blank');
      toast.success("Atendimento registrado com sucesso!");
    } catch (e: any) {
      toast.error("Erro ao enviar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const watchPropertyType = form.watch("property_type");
  const watchModel = form.watch("purifier_model");
  const watchProblemType = form.watch("problem_type");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#3399CC]">Dados Pessoais</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Nome Completo *</Label>
            <Input {...form.register("customer_name")} placeholder="Seu nome" />
          </div>
          <div className="grid gap-2">
            <Label>WhatsApp / Telefone *</Label>
            <Input {...form.register("customer_phone")} placeholder="(14) 99999-9999" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Cidade *</Label>
            <Input {...form.register("city")} placeholder="Jaú" />
          </div>
          <div className="grid gap-2">
            <Label>Bairro *</Label>
            <Input {...form.register("neighborhood")} placeholder="Centro" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Endereço Completo *</Label>
          <Input {...form.register("address")} placeholder="Rua, Número, Complemento" />
        </div>

        <LocationCapture onCapture={(loc) => {
          form.setValue("latitude", loc.latitude);
          form.setValue("longitude", loc.longitude);
          form.setValue("google_maps_link", loc.googleMapsLink);
        }} />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#3399CC]">Detalhes do Imóvel</h3>
        <div className="grid gap-2">
          <Label>Tipo de Imóvel *</Label>
          <Select onValueChange={(v: any) => form.setValue("property_type", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="apartamento">Apartamento</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {watchPropertyType === 'apartamento' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid gap-2">
              <Label>Andar</Label>
              <Input {...form.register("floor")} placeholder="Ex: 8" />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox id="elevator" onCheckedChange={(v: boolean) => form.setValue("has_elevator", v)} />
              <Label htmlFor="elevator">Possui Elevador?</Label>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox id="pressure" onCheckedChange={(v: boolean) => form.setValue("has_high_pressure_tank", v)} />
          <Label htmlFor="pressure">Existe caixa de alta pressão?</Label>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#3399CC]">Produto</h3>
        <div className="grid gap-2">
          <Label>Modelo do Purificador</Label>
          <Select onValueChange={(v) => form.setValue("purifier_model", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              <SelectItem value="Outro">Outro (digitar)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {watchModel === 'Outro' && (
          <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
            <Label>Qual o modelo?</Label>
            <Input {...form.register("other_model")} />
          </div>
        )}
      </div>

      {serviceType === 'suporte_tecnico' && (
        <div className="space-y-4 pt-4 border-t animate-in fade-in">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#3399CC]">Problema</h3>
          <div className="grid gap-2">
            <Label>Qual o problema? *</Label>
            <Select onValueChange={(v) => form.setValue("problem_type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o problema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Não gela">Não gela</SelectItem>
                <SelectItem value="Vazamento">Vazamento</SelectItem>
                <SelectItem value="Não sai água">Não sai água</SelectItem>
                <SelectItem value="Água com gosto estranho">Água com gosto estranho</SelectItem>
                <SelectItem value="Barulho anormal">Barulho anormal</SelectItem>
                <SelectItem value="Troca de peça">Troca de peça</SelectItem>
                <SelectItem value="Outro">Outro (descrever)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Descrição detalhada</Label>
            <Textarea {...form.register("problem_description")} placeholder="Descreva o que está acontecendo..." />
          </div>
        </div>
      )}

      {serviceType === 'troca_refil' && (
        <div className="space-y-4 pt-4 border-t animate-in fade-in">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#3399CC]">Histórico</h3>
          <div className="grid gap-2">
            <Label>Refil adquirido anteriormente na Acqua Soft?</Label>
            <RadioGroup onValueChange={(v) => form.setValue("bought_before", v === "yes")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="r1" />
                <Label htmlFor="r1">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="r2" />
                <Label htmlFor="r2">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {serviceType === 'manutencao_preventiva' && (
        <div className="space-y-4 pt-4 border-t animate-in fade-in">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#3399CC]">Manutenção</h3>
          <div className="grid gap-2">
            <Label>Última manutenção realizada:</Label>
            <Select onValueChange={(v) => form.setValue("last_maintenance", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Menos de 6 meses">Menos de 6 meses</SelectItem>
                <SelectItem value="6 meses">6 meses</SelectItem>
                <SelectItem value="1 ano">1 ano</SelectItem>
                <SelectItem value="Mais de 1 ano">Mais de 1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#3399CC]">Anexos (Fotos/Vídeos/Áudios)</h3>
        <MediaUpload onUpload={(urls) => form.setValue("media_urls", urls)} />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <Label>Observações Adicionais</Label>
        <Textarea {...form.register("observations")} placeholder="Alguma informação extra?" />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-[#003366] hover:bg-[#004080] h-14 text-lg font-black uppercase tracking-wider shadow-lg"
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        Enviar Atendimento
      </Button>
    </form>
  );
}
