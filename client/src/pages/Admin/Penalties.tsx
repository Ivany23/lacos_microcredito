import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { 
    AlertTriangle, Search, Filter, Calendar, Activity, 
    RefreshCw, Trash2, ArrowUpRight, Scale, 
    CheckCircle2, Clock, History, PlayCircle, Plus,
    X, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/auth.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClienteMinimo {
    nome: string;
    email: string;
    telefone: string;
}

interface Penalizacao {
    penalizacaoId: string;
    emprestimoId: string;
    clienteId: string;
    tipo: string;
    diasAtraso: number;
    valor: number;
    status: string;
    dataAplicacao: string;
    observacoes: string;
    cliente?: ClienteMinimo;
}

export default function AdminPenalties() {
    const { user } = useAuth();
    const token = user?.token || localStorage.getItem("token");
    const { toast } = useToast();
    
    const [penalidades, setPenalidades] = useState<Penalizacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("todas");
    const [isExecutingTask, setIsExecutingTask] = useState(false);
    
    // State for manual penalty form
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        emprestimoId: "",
        tipo: "Atraso",
        valor: "",
        observacoes: ""
    });

    const fetchPenalidades = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/penalizacoes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                // O backend retorna { sucesso: true, resumoGeral: ..., penalizacoes: [...] }
                setPenalidades(Array.isArray(data.penalizacoes) ? data.penalizacoes : []);
            } else {
                throw new Error("Erro ao carregar penalizações.");
            }
        } catch (error: any) {
            toast({
                title: "Erro de Conexão",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRunTask = async () => {
        try {
            setIsExecutingTask(true);
            const res = await fetch(`${API_BASE_URL}/tasks/run-penalties`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast({
                    title: "Rotina Executada",
                    description: "A verificação de atrasos e geração de multas foi concluída.",
                });
                fetchPenalidades();
            } else {
                throw new Error("Falha ao executar rotina.");
            }
        } catch (error: any) {
            toast({
                title: "Erro na Rotina",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsExecutingTask(false);
        }
    };

    const handleAddPenalty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/penalizacoes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    valor: Number(formData.valor)
                })
            });
            if (res.ok) {
                toast({ title: "Sucesso", description: "Penalização registrada manualmente." });
                setIsAddModalOpen(false);
                setFormData({ emprestimoId: "", tipo: "Atraso", valor: "", observacoes: "" });
                fetchPenalidades();
            } else {
                const error = await res.json();
                throw new Error(error.message || "Erro ao registrar.");
            }
        } catch (error: any) {
            toast({ title: "Erro no Registro", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/penalizacoes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast({ title: "Sucesso", description: "Penalização perdoada com êxito." });
                fetchPenalidades();
            } else {
                throw new Error("Falha ao perdoar penalidade.");
            }
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    useEffect(() => {
        if (token) fetchPenalidades();
    }, [token]);

    const filtered = penalidades.filter(p => {
        const matchesSearch = 
            p.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.emprestimoId?.toString().includes(searchTerm) ||
            p.tipo?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === "todas") return matchesSearch;
        if (activeTab === "pendentes") return matchesSearch && (p.status?.toLowerCase() === 'pendente' || p.status?.toLowerCase() === 'ativa' || p.status?.toLowerCase() === 'aplicada');
        if (activeTab === "pagas") return matchesSearch && (p.status?.toLowerCase() === 'paga' || p.status?.toLowerCase() === 'resolvida');
        return matchesSearch;
    });

    const getStatusInfo = (status: string) => {
        const s = status?.toLowerCase();
        if (s === "pendente" || s === "ativa" || s === "aplicada") 
            return { label: "Pendente", color: "bg-orange-100 text-orange-600 border-orange-200", icon: Clock };
        if (s === "paga" || s === "resolvida") 
            return { label: "Liquidada", color: "bg-emerald-100 text-emerald-600 border-emerald-200", icon: CheckCircle2 };
        if (s === "perdoada" || s === "cancelada") 
            return { label: "Perdoada", color: "bg-gray-100 text-gray-500 border-gray-200", icon: X };
        return { label: status, color: "bg-blue-100 text-blue-600 border-blue-200", icon: Info };
    };

    const stats = {
        totalPendentes: penalidades.filter(p => ['pendente', 'ativa', 'aplicada'].includes(p.status?.toLowerCase())).reduce((acc, curr) => acc + Number(curr.valor), 0),
        totalPagas: penalidades.filter(p => ['paga', 'resolvida'].includes(p.status?.toLowerCase())).reduce((acc, curr) => acc + Number(curr.valor), 0),
        countPendentes: penalidades.filter(p => ['pendente', 'ativa', 'aplicada'].includes(p.status?.toLowerCase())).length
    };

    return (
        <AdminLayout title="Monitor de Penalizações">
            <div className="flex flex-col gap-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-[#1C1C1E]">Controle de Sanções</h2>
                        <p className="text-[#8E8E93] text-sm font-medium">Gestão inteligente de multas e atrasos da carteira</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            className="bg-white border-[#E5E5EA] text-[#1C1C1E] font-bold rounded-2xl h-12 flex items-center gap-2 hover:bg-gray-50"
                            onClick={handleRunTask}
                            disabled={isExecutingTask}
                        >
                            <PlayCircle className={`w-5 h-5 text-primary ${isExecutingTask ? 'animate-spin' : ''}`} />
                            {isExecutingTask ? "Processando..." : "Executar Rotina"}
                        </Button>
                        
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-bold rounded-2xl h-12 shadow-md shadow-blue-100 flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Registrar Multa
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black">Nova Penalização</DialogTitle>
                                    <DialogDescription>Aplique uma sanção manual a um contrato específico.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddPenalty} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="empId" className="font-bold text-xs uppercase text-gray-500">ID do Empréstimo</Label>
                                        <Input 
                                            id="empId" 
                                            placeholder="Ex: 12" 
                                            className="rounded-xl bg-gray-50 border-none h-11 focus:ring-2 focus:ring-primary/20" 
                                            value={formData.emprestimoId}
                                            onChange={e => setFormData({...formData, emprestimoId: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tipo" className="font-bold text-xs uppercase text-gray-500">Tipo</Label>
                                            <select 
                                                id="tipo" 
                                                className="w-full rounded-xl bg-gray-50 border-none h-11 focus:ring-2 focus:ring-primary/20 text-sm px-3"
                                                value={formData.tipo}
                                                onChange={e => setFormData({...formData, tipo: e.target.value})}
                                            >
                                                <option value="Atraso">Atraso</option>
                                                <option value="Quebra Contrato">Quebra Contrato</option>
                                                <option value="Judicial">Judicial</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="valor" className="font-bold text-xs uppercase text-gray-500">Valor (MT)</Label>
                                            <Input 
                                                id="valor" 
                                                type="number"
                                                placeholder="0.00" 
                                                className="rounded-xl bg-gray-50 border-none h-11 focus:ring-2 focus:ring-primary/20" 
                                                value={formData.valor}
                                                onChange={e => setFormData({...formData, valor: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="obs" className="font-bold text-xs uppercase text-gray-500">Observações</Label>
                                        <Textarea 
                                            id="obs" 
                                            placeholder="Descreva o motivo da sanção..." 
                                            className="rounded-xl bg-gray-50 border-none min-h-[100px] focus:ring-2 focus:ring-primary/20"
                                            value={formData.observacoes}
                                            onChange={e => setFormData({...formData, observacoes: e.target.value})}
                                        />
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" className="w-full h-12 bg-primary font-bold rounded-xl">Confirmar Aplicação</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E5E5EA] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Scale className="w-24 h-24 text-red-500" />
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="w-12 h-12 bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.1em] mb-1">Risco em Aberto</p>
                                <h3 className="text-2xl font-black text-[#1C1C1E]">{stats.totalPendentes.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</h3>
                                <p className="text-[#8E8E93] text-xs font-bold mt-1">{stats.countPendentes} penalidades ativas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E5E5EA] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ArrowUpRight className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="w-12 h-12 bg-[#34C759]/10 text-[#34C759] rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.1em] mb-1">Total Recuperado</p>
                                <h3 className="text-2xl font-black text-[#1C1C1E]">{stats.totalPagas.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</h3>
                                <p className="text-[#34C759] text-xs font-bold mt-1">Impacto Positivo em Receita</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E5E5EA] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="w-24 h-24 text-blue-500" />
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="w-12 h-12 bg-[#007AFF]/10 text-[#007AFF] rounded-2xl flex items-center justify-center">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.1em] mb-1">Média de Eficácia</p>
                                <h3 className="text-2xl font-black text-[#1C1C1E]">
                                    {penalidades.length > 0 
                                        ? Math.round((stats.totalPagas / (stats.totalPagas + stats.totalPendentes || 1)) * 100)
                                        : 0}%
                                </h3>
                                <p className="text-[#8E8E93] text-xs font-bold mt-1">Conversão de sanções em pagamentos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[32px] shadow-sm border border-[#E5E5EA] overflow-hidden">
                    <div className="p-8 border-b border-[#F2F2F7] flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/50">
                        <Tabs defaultValue="todas" className="w-full lg:w-auto" onValueChange={setActiveTab}>
                            <TabsList className="bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                                <TabsTrigger value="todas" className="rounded-xl font-bold text-xs uppercase px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Todas</TabsTrigger>
                                <TabsTrigger value="pendentes" className="rounded-xl font-bold text-xs uppercase px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Ativas</TabsTrigger>
                                <TabsTrigger value="pagas" className="rounded-xl font-bold text-xs uppercase px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Pagas</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-80">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
                                <input
                                    type="text"
                                    placeholder="Localizar sanção..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-[#F2F2F7] border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 rounded-2xl outline-none transition-all text-sm font-bold placeholder:text-[#AEAEB2]"
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={fetchPenalidades} 
                                className="w-12 h-12 bg-[#F2F2F7] rounded-2xl hover:bg-gray-200 transition-all shrink-0"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-primary' : 'text-[#1C1C1E]'}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">Beneficiário & Contrato</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">Classificação</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">Atraso</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">Valor Sanção</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">Situação</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">Data Registro</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em] text-right">Controle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F2F2F7]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-[#8E8E93] font-bold text-sm">Sincronizando Penalidades...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <AlertTriangle className="w-16 h-16 mb-2" />
                                                <p className="font-black text-xl">Nenhum Registro</p>
                                                <p className="text-sm font-bold italic">Nenhuma penalização encontrada para este filtro.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((penalizacao) => {
                                        const status = getStatusInfo(penalizacao.status);
                                        return (
                                            <tr key={penalizacao.penalizacaoId} className="group hover:bg-[#F9F9FB] transition-colors border-l-4 border-l-transparent hover:border-l-primary">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center font-black text-xs">
                                                            #{penalizacao.emprestimoId}
                                                        </div>
                                                        <div>
                                                            <p className="text-[#1C1C1E] font-black text-[15px]">{penalizacao.cliente?.nome || `Cliente #${penalizacao.clienteId}`}</p>
                                                            <p className="text-[#8E8E93] text-xs font-bold tracking-tight">{penalizacao.cliente?.telefone || "Contato não disponível"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-[#1C1C1E] font-bold text-sm">{penalizacao.tipo}</p>
                                                        {penalizacao.observacoes && (
                                                            <p className="text-[#8E8E93] text-[10px] font-medium italic truncate max-w-[150px]" title={penalizacao.observacoes}>
                                                                "{penalizacao.observacoes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`flex items-center gap-2 font-bold text-sm ${penalizacao.diasAtraso > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                        <Clock className="w-4 h-4" />
                                                        {penalizacao.diasAtraso} dias
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-[#1C1C1E] font-black text-[15px]">
                                                        {Number(penalizacao.valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border ${status.color} font-black text-[10px] uppercase tracking-wider`}>
                                                        <status.icon className="w-3.5 h-3.5" />
                                                        {status.label}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <p className="text-[#1C1C1E] font-bold text-sm">{new Date(penalizacao.dataAplicacao).toLocaleDateString('pt-MZ')}</p>
                                                        <p className="text-[#8E8E93] text-[10px] font-medium">{new Date(penalizacao.dataAplicacao).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <button 
                                                                className="p-3 text-[#AEAEB2] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-2xl transition-all"
                                                                title="Gestão de Penalidade"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-sm rounded-[32px]">
                                                            <DialogHeader>
                                                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-4 mx-auto">
                                                                    <Trash2 className="w-8 h-8" />
                                                                </div>
                                                                <DialogTitle className="text-center text-xl font-black">Perdoar Sanção?</DialogTitle>
                                                                <DialogDescription className="text-center font-medium">
                                                                    Esta ação removerá a cobrança de <b>{Number(penalizacao.valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</b> do cliente. Esta ação não pode ser desfeita.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
                                                                <Button 
                                                                    onClick={() => handleDelete(penalizacao.penalizacaoId)}
                                                                    className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-black h-12 rounded-2xl"
                                                                >
                                                                    Sim, Perdoar Penalidade
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    className="w-full text-[#8E8E93] font-bold h-12 rounded-2xl"
                                                                    onClick={() => {}} // Close handle
                                                                >
                                                                    Manter Registro
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-8 bg-gray-50/50 border-t border-[#F2F2F7] flex justify-between items-center">
                        <p className="text-[#8E8E93] text-xs font-bold uppercase tracking-widest">
                            Mostrando {filtered.length} de {penalidades.length} sanções
                        </p>
                        <div className="flex gap-2">
                           {/* Pagination simulated if needed */}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
