import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Users, FileText, Wrench, RefreshCw, ShieldCheck, BarChart3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  };

  const filteredRequests = requests.filter(r => 
    r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total', value: requests.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Orçamentos', value: requests.filter(r => r.request_type === 'orcamento').length, icon: BarChart3, color: 'text-sky-600' },
    { label: 'Suporte', value: requests.filter(r => r.request_type === 'suporte_tecnico').length, icon: Wrench, color: 'text-orange-600' },
    { label: 'Refil', value: requests.filter(r => r.request_type === 'troca_refil').length, icon: RefreshCw, color: 'text-green-600' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tight">Painel Administrativo</h1>
          <p className="text-slate-500 font-medium italic">Acqua Soft Purificadores • Gestão de Atendimentos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className="text-2xl font-black text-slate-800">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="pb-0 border-b">
          <div className="flex justify-between items-center pb-4">
            <CardTitle className="text-lg font-black uppercase tracking-tight text-[#003366]">Chamados Recentes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar cliente ou cidade..." 
                className="pl-10 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Data</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Cliente</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Tipo</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Local</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Nenhum chamado encontrado.</TableCell></TableRow>
              ) : filteredRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-xs font-medium text-slate-500">
                    {format(new Date(req.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-700">{req.customer_name}</div>
                    <div className="text-[10px] text-slate-400">{req.customer_phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter">
                      {req.request_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {req.city} - {req.neighborhood}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0 text-[9px] font-black uppercase">
                      {req.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
