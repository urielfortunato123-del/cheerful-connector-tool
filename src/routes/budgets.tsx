import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  Bot, 
  Sparkles, 
  FileSpreadsheet,
  Plus,
  Trash2,
  Download,
  History,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { askGeneralAI } from "@/lib/server-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { processExcelFile, exportToExcel } from "@/lib/offline-processor";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';


export const Route = createFileRoute("/budgets")({
  component: Budgets,
});

type BudgetItem = {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  phase: string;
};

const DER_PHASES = [
  "Fase 21 - SERVIÇOS PRELIMINARES",
  "Fase 22 - TERRAPLENAGEM",
  "Fase 23 - PAVIMENTAÇÃO",
  "Fase 24 - OBRAS DE ARTE E DRENAGEM",
  "Fase 28 - SINALIZAÇÃO E ELEMENTOS DE SEGURANÇA",
  "Fase 30 - SERVIÇOS DE PROTEÇÃO AO MEIO AMBIENTE",
  "Fase 36 - CANTEIRO DE OBRAS"
];

const INITIAL_ITEMS: BudgetItem[] = [
  { id: "1", code: "23.02.01", description: "MELH/PREPARO SUB-LEITO - 100% EN", unit: "m2", quantity: 2137.00, unitPrice: 2.47, totalPrice: 5278.39, phase: "Fase 23 - PAVIMENTAÇÃO" },
  { id: "2", code: "23.04.01.04.01", description: "SUB BASE OU BASE SOLO CIM.6%-USINA COM TRANSP. JAZIDA ATE LOCAL APLICACAO", unit: "m3", quantity: 320.55, unitPrice: 185.23, totalPrice: 59375.47, phase: "Fase 23 - PAVIMENTAÇÃO" },
  { id: "3", code: "23.08.03.01", description: "CAMADA ROLAMENTO-CBUQ GRADUACAO C-S/DOP", unit: "m3", quantity: 8804.22, unitPrice: 1601.11, totalPrice: 14096524.68, phase: "Fase 23 - PAVIMENTAÇÃO" },
  { id: "4", code: "24.16.17", description: "TUBO DE CONCRETO D=1,00M CLASSE PA-3", unit: "m", quantity: 230.00, unitPrice: 1037.60, totalPrice: 238648.00, phase: "Fase 24 - OBRAS DE ARTE E DRENAGEM" },
];

function Budgets() {
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<BudgetItem[]>(INITIAL_ITEMS);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState({
    object: "Estudo LIN-030",
    contract: "21.829-7",
    baseDate: "Set 2021",
    highway: "LIN-030",
    extension: 3.50
  });

  const totals = useMemo(() => {
    const total = items.reduce((acc, item) => acc + item.totalPrice, 0);
    return {
      total,
      perKm: contractInfo.extension > 0 ? total / contractInfo.extension : 0
    };
  }, [items, contractInfo.extension]);

  // Carregar dados locais ao iniciar
  useEffect(() => {
    const loadData = async () => {
      const savedBudget = await db.budgets.orderBy('id').last();
      if (savedBudget) {
        setItems(savedBudget.itens);
        setContractInfo({
          object: savedBudget.observacoes || "Sem objeto",
          contract: "N/A",
          baseDate: savedBudget.dataBase,
          highway: "Não especificado",
          extension: 0
        });
        toast.info("Orçamento local recuperado.");
      }
    };
    loadData();
  }, []);

  // Salvar automaticamente no DB local
  useEffect(() => {
    const saveData = async () => {
      // Find current project if any, otherwise use a generic ID or allow creating one
      const budgetData = {
        projectId: 1, // Mock project ID for now, should be connected to actual project
        dataBase: contractInfo.baseDate,
        itens: items,
        valorTotal: totals.total,
        observacoes: contractInfo.object,
      };
      
      const existing = await db.budgets.where('observacoes').equals(contractInfo.object).first();
      if (existing) {
        await db.budgets.update(existing.id!, budgetData);
      } else {
        await db.budgets.add(budgetData);
      }
    };
    if (items.length > 0 && contractInfo.object) saveData();
  }, [items, contractInfo, totals.total]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result: any = await processExcelFile(file);
      if (result.data && Array.isArray(result.data)) {
        // Mapeamento simples de colunas para o formato do orçamento
        const mappedItems: BudgetItem[] = result.data.map((row: any, idx: number) => ({
          id: Math.random().toString(36).substr(2, 9),
          code: row.Código || row.code || "",
          description: row.Descrição || row.description || "Item Importado",
          unit: row.Unidade || row.unit || "un",
          quantity: Number(row.Quantidade || row.quantity || 0),
          unitPrice: Number(row.Preço || row.price || 0),
          totalPrice: Number(row.Total || row.total || 0),
          phase: row.Fase || "Importado"
        }));
        setItems(mappedItems);
        toast.success(`${mappedItems.length} itens importados com sucesso.`);
      }
    } catch (err) {
      toast.error("Falha ao importar planilha.");
    }
  };

  const handleExport = () => {
    exportToExcel(items, `Orcamento_${contractInfo.contract}`);
    toast.success("Excel exportado com sucesso.");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ORÇAMENTO TÉCNICO - INFRAFLOW", 10, 20);
    
    doc.setFontSize(10);
    doc.text(`Objeto: ${contractInfo.object}`, 10, 30);
    doc.text(`Data Base: ${contractInfo.baseDate}`, 10, 36);
    doc.text(`Total: R$ ${totals.total.toLocaleString('pt-BR')}`, 10, 42);

    autoTable(doc, {
      startY: 50,
      head: [['Código', 'Descrição', 'Und', 'Qtd', 'Unit (R$)', 'Total (R$)']],
      body: items.map(i => [i.code, i.description, i.unit, i.quantity, i.unitPrice.toFixed(2), i.totalPrice.toFixed(2)]),
      theme: 'striped',
      headStyles: { fillStyle: '#FF6B00' } as any
    });

    doc.save(`Orcamento_${contractInfo.object}.pdf`);
    toast.success("PDF exportado com sucesso.");
  };



  const getAiHelp = async () => {
    setIsAiLoading(true);
    try {
      const budgetSummary = items.map(i => `${i.code}: ${i.description} (${i.unit})`).join(", ");
      const response = await (askGeneralAI as any)({ 
        data: { 
          question: `Análise técnica deste orçamento do DER-SP: Objeto ${contractInfo.object}, Rodovia ${contractInfo.highway}. Total: R$ ${totals.total.toLocaleString("pt-BR")}. Itens: ${budgetSummary.substring(0, 500)}... Me dê insights sobre produtividade ou possíveis omissões baseadas em normas DNIT/DER.`,
          context: "O usuário está visualizando a planilha de orçamento digitalizada do DER."
        } 
      });
      setAiSuggestion((response as any).answer);
    } catch (error) {
      toast.error("IA offline-mode: Usando base de conhecimento local.");
      setAiSuggestion("Devido ao modo offline, a análise profunda está limitada. Recomendo verificar a composição de CBUQ conforme ET-DE-P00/013 do DER-SP.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      code: "",
      description: "Novo Item",
      unit: "un",
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      phase: DER_PHASES[0]
    };
    setItems([...items, newItem]);
    toast.success("Novo item adicionado");
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const steps = [
    { title: "Dados do Contrato", icon: FileSpreadsheet },
    { title: "Planilha de Itens", icon: Calculator },
    { title: "Resumo & IA", icon: Bot },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Orçamento Digital DER
          </h1>
          <p className="text-sm text-muted-foreground">Sistema de substituição de planilhas físicas do DER-SP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Histórico em breve")}>
            <History className="h-4 w-4" /> Histórico
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
          <Button size="sm" className="gap-2" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
          </Button>

          <div className="relative">
            <Button size="sm" variant="secondary" className="gap-2">
              <Upload className="h-4 w-4" /> Importar DER
            </Button>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept=".xlsx,.xls" 
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {steps.map((step, i) => (
          <div 
            key={i} 
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
              currentStep === i + 1 
                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                : "bg-muted/50 border-transparent text-muted-foreground"
            }`}
          >
            <step.icon className="h-5 w-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">{step.title}</span>
          </div>
        ))}
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Objeto / Estudo</Label>
                    <Input 
                      value={contractInfo.object} 
                      onChange={(e) => setContractInfo({...contractInfo, object: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contrato nº</Label>
                    <Input 
                      value={contractInfo.contract}
                      onChange={(e) => setContractInfo({...contractInfo, contract: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Base</Label>
                    <Input 
                      value={contractInfo.baseDate}
                      onChange={(e) => setContractInfo({...contractInfo, baseDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Extensão (km)</Label>
                    <Input 
                      type="number"
                      value={contractInfo.extension}
                      onChange={(e) => setContractInfo({...contractInfo, extension: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-1" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-primary">Dica de Configuração</p>
                  <p className="text-muted-foreground">A Data Base influencia diretamente nos índices de reajuste (IGP/IMO/IGE) aplicados às fases do DER.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Código</TableHead>
                    <TableHead>Descrição do Subitem</TableHead>
                    <TableHead className="w-[80px]">Und</TableHead>
                    <TableHead className="w-[100px] text-right">Qtd</TableHead>
                    <TableHead className="w-[120px] text-right">Unit (R$)</TableHead>
                    <TableHead className="w-[120px] text-right">Total (R$)</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <Input 
                          className="h-8 text-xs font-mono" 
                          value={item.code} 
                          onChange={(e) => updateItem(item.id, "code", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          className="h-8 text-xs" 
                          value={item.description} 
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          className="h-8 text-xs uppercase" 
                          value={item.unit} 
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="h-8 text-xs text-right" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="h-8 text-xs text-right" 
                          value={item.unitPrice} 
                          onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold">
                        {item.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 bg-muted/20 border-t flex justify-between items-center">
                <Button variant="outline" size="sm" className="gap-2" onClick={addItem}>
                  <Plus className="h-4 w-4" /> Adicionar Item
                </Button>
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Parcial</p>
                  <p className="text-lg font-bold text-primary">R$ {totals.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Geral</p>
                  <p className="text-2xl font-black text-primary">R$ {totals.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-transparent space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Custo por KM</p>
                  <p className="text-2xl font-black">R$ {totals.perKm.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-transparent space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Status do Orçamento</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Finalizado</Badge>
                    <span className="text-[10px] text-muted-foreground">Pronto para exportar</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    Análise Técnica da IA (Consultoria)
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getAiHelp} 
                    disabled={isAiLoading}
                    className="gap-2 border-primary/20 hover:bg-primary/10"
                  >
                    {isAiLoading ? "Analisando planilha..." : "Refazer Análise"} <Sparkles className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 min-h-[150px]">
                  {aiSuggestion ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-muted-foreground">
                      {aiSuggestion.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-3 py-4">
                      <Bot className="h-10 w-10 text-primary/20 animate-pulse" />
                      <p className="text-xs text-muted-foreground text-center max-w-[250px]">
                        Clique em "Refazer Análise" para que a IA analise a coerência técnica dos seus itens com as normas do DER-SP.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pb-8">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentStep(currentStep - 1)} 
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button 
          onClick={() => currentStep < 3 ? setCurrentStep(currentStep + 1) : toast.success("Orçamento finalizado!")}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          {currentStep === 3 ? "Finalizar Orçamento" : "Próximo Passo"} 
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
