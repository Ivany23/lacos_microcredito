import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { 
    AlertTriangle, Search, Filter, Calendar, Activity, 
    RefreshCw, Trash2, ArrowUpRight, ArrowDownRight, Scale
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/auth.service";

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
                setPenalidades(data);
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

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja perdoar/remover esta penalidade?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/penalizacoes/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                toast({
                    title: "Sucesso",
                    description: "Penalização removida com êxito.",
                });
                fetchPenalidades();
            } else {
                throw new Error("Falha ao remover penalidade.");
            }
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (token) fetchPenalidades();
    }, [token]);

    const filtered = penalidades.filter(p => 
        p.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.emprestimoId?.toString().includes(searchTerm) ||
        p.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === "pendente" || s === "ativa") return "bg-orange-100 text-orange-600 border-orange-200";
        if (s === "paga" || s === "resolvida") return "bg-emerald-100 text-emerald-600 border-emerald-200";
        if (s === "perdoada") return "bg-gray-100 text-gray-500 border-gray-200";
        return "bg-blue-100 text-blue-600 border-blue-200";
    };

    const totalPendentes = penalidades.filter(p => p.status?.toLowerCase() === 'pendente' || p.status?.toLowerCase() === 'ativa').reduce((acc, curr) => acc + Number(curr.valor), 0);

    return (
        <AdminLayout title="Gestão de Penalizações">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E5EA] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                            <Scale className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[#8E8E93] text-sm font-semibold uppercase tracking-wider mb-1">Total Registos</p>
                            <h3 className="text-3xl font-black text-[#1C1C1E]">{penalidades.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E5EA] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-24 h-24 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[#8E8E93] text-sm font-semibold uppercase tracking-wider mb-1">Valor Pendente</p>
                            <h3 className="text-3xl font-black text-[#1C1C1E]">{totalPendentes.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E5E5EA] overflow-hidden">
                <div className="p-6 border-b border-[#E5E5EA] flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, empréstimo ou tipo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#F2F2F7] border-transparent focus:border-[#007AFF] focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold placeholder:font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={fetchPenalidades} className="w-12 h-12 flex items-center justify-center bg-[#F2F2F7] text-[#1C1C1E] rounded-2xl hover:bg-[#E5E5EA] transition-all">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F2F2F7]/50 border-b border-[#E5E5EA]">
                                <th className="px-6 py-4 text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Cliente & Emp.</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Atraso</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8E8E93] uppercase tracking-wider text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5EA]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#8E8E93] font-medium">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="w-8 h-8 animate-spin text-[#007AFF]" />
                                            <span>Carregando dados...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#8E8E93] font-medium">
                                        Nenhuma penalização encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((penalizacao) => (
                                    <tr key={penalizacao.penalizacaoId} className="hover:bg-[#F2F2F7]/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#007AFF]/10 text-[#007AFF] rounded-full flex items-center justify-center font-bold text-sm">
                                                    #{penalizacao.emprestimoId}
                                                </div>
                                                <div>
                                                    <p className="text-[#1C1C1E] font-bold text-sm">{penalizacao.cliente?.nome || `Cliente #${penalizacao.clienteId}`}</p>
                                                    <p className="text-[#8E8E93] text-xs font-medium">{penalizacao.cliente?.telefone || "Sem contato"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#1C1C1E] font-bold text-sm capitalize">{penalizacao.tipo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-red-500 font-bold text-sm flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {penalizacao.diasAtraso} dias
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#1C1C1E] font-black text-sm">
                                                {Number(penalizacao.valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center w-max gap-1 ${getStatusColor(penalizacao.status)}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                {penalizacao.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#8E8E93] font-medium text-sm flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(penalizacao.dataAplicacao).toLocaleDateString('pt-MZ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(penalizacao.penalizacaoId)}
                                                className="p-2 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-xl transition-all"
                                                title="Remover/Perdoar Penalização"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
