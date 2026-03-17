import { AdminLayout } from "@/components/AdminLayout";
import { Wallet, Search, Filter, X, Loader2, Calendar, FileText, Image as ImageIcon, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { clientDetailService } from "@/lib/client-detail.service";

const API_BASE_URL = "https://lacos-microcredito-api.vercel.app";

export default function AdminLoans() {
    const { toast } = useToast();
    const [loans, setLoans] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [calendarioData, setCalendarioData] = useState<any>(null);
    const [loadingCalendario, setLoadingCalendario] = useState(false);
    const [isCalendarioModalOpen, setIsCalendarioModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState("Todos");

    const [formData, setFormData] = useState({
        clienteId: "",
        valor: "",
        dataVencimento: "",
        
        testemunhaNome: "",
        testemunhaTelefone: "",
        grauParentesco: "Amigo",
        testemunhaDocumento: "BI",
        arquivoDocumento: null as File | null,
        
        descricaoItem: "",
        valorEstimado: "",
        imagemPenhor: null as File | null,
    });

    const grausParentesco = ["Pai", "Mae", "Filho", "Filha", "Irmao", "Irma", "Conjuge", "Tio", "Tia", "Primo", "Prima", "Amigo", "Colega de Trabalho", "Vizinho"];
    const tiposDocumento = ["BI", "Passaporte", "Carta de Conducao", "NUIT", "DIRE"];

    const fetchData = async (status?: string) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            const queryParam = status && status !== "Todos" ? `?status=${status}` : "";
            const reqEmprestimos = await fetch(`${API_BASE_URL}/emprestimos${queryParam}`, { headers });
            if (reqEmprestimos.ok) {
                const dataLoans = await reqEmprestimos.json();
                setLoans(dataLoans);
            }

            const reqClientes = await fetch(`${API_BASE_URL}/clientes`, { headers });
            if (reqClientes.ok) {
                const dataClientes = await reqClientes.json();
                setClientes(dataClientes);
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast({ title: "Erro", description: "Falha ao carregar empréstimos e clientes.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            
            const resEmprestimo = await fetch(`${API_BASE_URL}/emprestimos`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    clienteId: formData.clienteId,
                    valor: Number(formData.valor),
                    dataVencimento: formData.dataVencimento
                })
            });

            if (!resEmprestimo.ok) throw new Error("Erro ao criar empréstimo");
            const newLoan = await resEmprestimo.json();
            const loanId = newLoan.emprestimoId || newLoan.id;

            if (formData.testemunhaNome && formData.testemunhaTelefone) {
                const formTestemunha = new FormData();
                formTestemunha.append("clienteId", formData.clienteId);
                formTestemunha.append("emprestimoId", loanId);
                formTestemunha.append("nome", formData.testemunhaNome);
                formTestemunha.append("telefone", formData.testemunhaTelefone);
                formTestemunha.append("grauParentesco", formData.grauParentesco);
                formTestemunha.append("testemunhaDocumento", formData.testemunhaDocumento);
                if (formData.arquivoDocumento) {
                    formTestemunha.append("arquivoDocumento", formData.arquivoDocumento);
                }

                await fetch(`${API_BASE_URL}/testemunhas`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formTestemunha
                });
            }

            if (formData.descricaoItem && formData.valorEstimado) {
                const formPenhor = new FormData();
                formPenhor.append("clienteId", formData.clienteId);
                formPenhor.append("emprestimoId", loanId);
                formPenhor.append("descricaoItem", formData.descricaoItem);
                formPenhor.append("valorEstimado", formData.valorEstimado.toString());
                if (formData.imagemPenhor) {
                    formPenhor.append("imagemPenhor", formData.imagemPenhor);
                }

                await fetch(`${API_BASE_URL}/penhor`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formPenhor
                });
            }

            toast({ title: "Sucesso", description: "Proposta criada com sucesso!" });
            setModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error("Erro na submissão:", error);
            toast({ title: "Erro", description: error.message || "Falha ao submeter proposta.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLoan = async (loan: any) => {
        const loanId = loan.emprestimoId || loan.id;
        setIsDeleting(loanId);
        try {
            await clientDetailService.deleteLoan(loanId);
            toast({ title: "Sucesso", description: "Empréstimo e dados relacionados removidos." });
            fetchData();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    const setModalOpen = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            
            setFormData({
                clienteId: "", valor: "", dataVencimento: "",
                testemunhaNome: "", testemunhaTelefone: "", grauParentesco: "Amigo", testemunhaDocumento: "BI", arquivoDocumento: null,
                descricaoItem: "", valorEstimado: "", imagemPenhor: null
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APROVADO': case 'Aprovado': case 'Ativo': return 'bg-[#34C759] text-white';
            case 'PENDENTE': case 'Pendente': return 'bg-[#FF9500] text-white';
            case 'REJEITADO': case 'Rejeitado': case 'Inadimplente': return 'bg-[#FF3B30] text-white';
            case 'PAGO': case 'Pago': return 'bg-[#007AFF] text-white';
            default: return 'bg-[#8E8E93] text-white';
        }
    };

    const handleVerCalendario = async (loan: any) => {
        const emprestimoId = loan.emprestimoId || loan.id;
        setSelectedLoan(loan);
        setIsCalendarioModalOpen(true);
        setLoadingCalendario(true);
        setCalendarioData(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/pagamentos/calendario/${emprestimoId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setCalendarioData(result);
            } else {
                setCalendarioData(null);
            }
        } catch (error) {
            console.error("Erro ao carregar calendário:", error);
            toast({ title: "Erro", description: "Falha ao carregar calendário.", variant: "destructive" });
        } finally {
            setLoadingCalendario(false);
        }
    };

    const closeCalendarioModal = () => {
        setIsCalendarioModalOpen(false);
        setCalendarioData(null);
        setSelectedLoan(null);
    };

    const getCalendarStatusColor = (status: string) => {
        switch (status) {
            case 'PAGO': return 'bg-[#34C759] text-white';
            case 'SEM PAGAMENTO': return 'bg-[#FF3B30] text-white';
            case 'HOJE': return 'bg-[#007AFF] text-white';
            case 'QUITADO': return 'bg-[#A8E6CF] text-[#1C1C1E]';
            default: return 'bg-[#F2F2F7] text-[#8E8E93]';
        }
    };

    return (
        <AdminLayout title="Empréstimos">
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h2 className="text-[34px] font-[900] text-[#1C1C1E] tracking-tight leading-tight">
                            Empréstimos
                        </h2>
                        <p className="text-[#8E8E93] font-semibold text-sm">
                            Ciclo de vida dos contratos e concessões
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-12 px-6 bg-white border border-[#E5E5EA] text-[#1C1C1E] font-bold rounded-2xl flex items-center gap-2 hover:bg-[#F2F2F7] transition-all">
                            Exportar PDF
                        </button>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="h-12 px-6 bg-[#007AFF] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-[#0066D6] transition-all active:scale-95"
                        >
                            Nova Proposta
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['Todos', 'Ativos', 'Atrasados', 'Liquidados'].map((filter, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setFilterStatus(filter);
                                fetchData(filter);
                            }}
                            className={`h-14 rounded-2xl font-bold transition-all ${filterStatus === filter
                                ? "bg-[#1C1C1E] text-white"
                                : "bg-white border border-[#E5E5EA] text-[#8E8E93] hover:border-[#007AFF] hover:text-[#007AFF]"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[#007AFF] animate-spin" />
                    </div>
                ) : loans.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loans.map((loan, idx) => (
                                <LoanCard
                                    key={loan.emprestimoId || loan.id || idx}
                                    loan={loan}
                                    onVerCalendario={() => handleVerCalendario(loan)}
                                    onDelete={() => handleDeleteLoan(loan)}
                                    isDeleting={isDeleting === (loan.emprestimoId || loan.id)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-[40px] p-12 border border-[#E5E5EA] flex flex-col items-center justify-center text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                        <div className="w-20 h-20 bg-[#F2F2F7] rounded-full flex items-center justify-center">
                            <Wallet className="w-10 h-10 text-[#AEAEB2]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-[#1C1C1E]">Sem Empréstimos</h3>
                            <p className="text-[#8E8E93] font-medium max-w-sm">
                                Não há empréstimos registados. Clique em "Nova Proposta" para adicionar o primeiro empréstimo.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 relative">
                        {}
                        <div className="flex justify-between items-center p-6 border-b border-[#F2F2F7]">
                            <h3 className="text-xl font-black text-[#1C1C1E]">Solicitar Empréstimo</h3>
                            <button onClick={() => setModalOpen(false)} className="p-2 bg-[#F2F2F7] rounded-full text-[#8E8E93] hover:text-[#FF3B30] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {}
                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8 flex-1">

                            {}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 font-bold text-[#1C1C1E] border-b pb-2"><Wallet className="w-5 h-5 text-[#007AFF]" /> 1. Dados do Empréstimo</h4>

                                <div>
                                    <label className="block text-sm font-bold text-[#8E8E93] mb-1">Cliente *</label>
                                    <select
                                        name="clienteId" required value={formData.clienteId} onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] text-[#1C1C1E] focus:bg-white focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all outline-none"
                                    >
                                        <option value="">Selecione um cliente...</option>
                                        {clientes.map(c => (
                                            <option key={c.clienteId || c.id} value={c.clienteId || c.id}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-[#8E8E93] mb-1">Valor do Empréstimo (MZN) *</label>
                                        <input
                                            type="number" name="valor" required value={formData.valor} onChange={handleChange} min="1"
                                            className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:bg-white focus:border-[#007AFF] outline-none transition-all"
                                            placeholder="Ex: 5000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#8E8E93] mb-1">Data de Vencimento *</label>
                                        <input
                                            type="date" name="dataVencimento" required value={formData.dataVencimento} onChange={handleChange}
                                            className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:bg-white focus:border-[#007AFF] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 font-bold text-[#1C1C1E] border-b pb-2"><FileText className="w-5 h-5 text-[#FF9500]" /> 2. Adicionar Testemunha <span className="text-xs text-[#8E8E93] font-normal">(Opcional)</span></h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-[#8E8E93] mb-1">Nome Completo</label>
                                        <input
                                            type="text" name="testemunhaNome" value={formData.testemunhaNome} onChange={handleChange}
                                            className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-white outline-none" placeholder="Nome da testemunha"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#8E8E93] mb-1">Telefone</label>
                                        <input
                                            type="text" name="testemunhaTelefone" value={formData.testemunhaTelefone} onChange={handleChange}
                                            className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-white outline-none" placeholder="+258..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#8E8E93] mb-1">Grau de Parentesco</label>
                                        <select name="grauParentesco" value={formData.grauParentesco} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-white outline-none">
                                            {grausParentesco.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#8E8E93] mb-1">Tipo de Documento</label>
                                        <select name="testemunhaDocumento" value={formData.testemunhaDocumento} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-white outline-none">
                                            {tiposDocumento.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="block text-sm font-bold text-[#8E8E93] mb-1">Anexo do Documento (BI, Passaporte, etc.)</label>
                                    <input
                                        type="file" name="arquivoDocumento" onChange={handleChange} accept="image/*,.pdf"
                                        className="w-full block text-sm text-[#8E8E93] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-[#007AFF]/10 file:text-[#007AFF] hover:file:bg-[#007AFF]/20 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            {}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 font-bold text-[#1C1C1E] border-b pb-2"><ImageIcon className="w-5 h-5 text-[#34C759]" /> 3. Adicionar Penhor <span className="text-xs text-[#8E8E93] font-normal">(Opcional)</span></h4>
                                <div>
                                    <label className="block text-sm font-bold text-[#8E8E93] mb-1">Descrição do Item</label>
                                    <input
                                        type="text" name="descricaoItem" value={formData.descricaoItem} onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-white outline-none" placeholder="Ex: Computador, TV, etc"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#8E8E93] mb-1">Valor Estimado do Item (MZN)</label>
                                    <input
                                        type="number" name="valorEstimado" value={formData.valorEstimado} onChange={handleChange} min="0"
                                        className="w-full h-12 px-4 rounded-xl border border-[#E5E5EA] bg-white outline-none" placeholder="Ex: 15000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#8E8E93] mb-1">Fotografia do Penhor</label>
                                    <input
                                        type="file" name="imagemPenhor" onChange={handleChange} accept="image/*"
                                        className="w-full block text-sm text-[#8E8E93] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-[#34C759]/10 file:text-[#34C759] hover:file:bg-[#34C759]/20 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                        </form>

                        {}
                        <div className="p-6 border-t border-[#F2F2F7] flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-6 py-3 font-bold text-[#8E8E93] bg-white border border-[#E5E5EA] hover:bg-[#F2F2F7] rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.clienteId || !formData.valor || !formData.dataVencimento}
                                className="px-8 py-3 font-bold text-white bg-[#007AFF] rounded-xl flex items-center gap-2 hover:bg-[#0066D6] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Proposta"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {}
            {isCalendarioModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeCalendarioModal}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"></div>

                    <div
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-[#F2F2F7]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#007AFF] rounded-xl flex items-center justify-center text-white">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#1C1C1E]">Calendário de Pagamentos</h3>
                                    {selectedLoan && (
                                        <p className="text-xs text-[#8E8E93]">
                                            Empréstimo de {Number(selectedLoan.valorPrincipal || selectedLoan.valor || 0).toLocaleString()} MZN
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={closeCalendarioModal}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F2F2F7] transition-colors"
                            >
                                <X className="w-5 h-5 text-[#8E8E93]" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)]">
                            {loadingCalendario ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin mb-3" />
                                    <p className="text-[#8E8E93] font-medium">Carregando calendário...</p>
                                </div>
                            ) : calendarioData ? (
                                <>
                                    {calendarioData.resumo && (
                                        <div className="flex gap-4 mb-5">
                                            <div className="flex-1 p-4 bg-[#F2F2F7] rounded-2xl text-center">
                                                <p className="text-xs text-[#8E8E93] mb-1">Saldo Devedor</p>
                                                <p className="font-black text-xl text-[#1C1C1E]">
                                                    {Number(calendarioData.resumo.saldoDevedor || 0).toLocaleString()} <span className="text-xs text-[#8E8E93]">MZN</span>
                                                </p>
                                            </div>
                                            <div className="flex-1 p-4 bg-[#34C759]/10 rounded-2xl text-center">
                                                <p className="text-xs text-[#8E8E93] mb-1">Percentual Pago</p>
                                                <p className="font-black text-xl text-[#34C759]">
                                                    {calendarioData.resumo.percentualPago || '0%'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3 mb-4 text-xs">
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#34C759]"></span> Pago</span>
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#FF3B30]"></span> Sem Pagamento</span>
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#007AFF]"></span> Hoje</span>
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F2F2F7] border"></span> Futuro</span>
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#A8E6CF]"></span> Quitado</span>
                                    </div>

                                    {calendarioData.calendario && calendarioData.calendario.length > 0 ? (
                                        <div className="grid grid-cols-7 gap-1.5">
                                            {calendarioData.calendario.map((dia: any, idx: number) => {
                                                const date = new Date(dia.data + 'T00:00:00');
                                                const dayNum = date.getDate();
                                                const monthShort = date.toLocaleDateString('pt-PT', { month: 'short' });

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-2 rounded-xl text-center text-xs cursor-default transition-transform hover:scale-105 ${getCalendarStatusColor(dia.status)}`}
                                                        title={`${dia.data} — ${dia.status} — ${Number(dia.valor || 0).toLocaleString()} MZN`}
                                                    >
                                                        <div className="font-bold text-sm leading-tight">{dayNum}</div>
                                                        <div className="text-[10px] opacity-75 leading-tight">{monthShort}</div>
                                                        {dia.valor > 0 && (
                                                            <div className="text-[9px] font-semibold mt-0.5 leading-tight">
                                                                {Number(dia.valor).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center text-[#8E8E93] py-8">Nenhum dado de calendário disponível.</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-[#8E8E93] py-8">Erro ao carregar dados do calendário.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function LoanCard({ loan, onVerCalendario, onDelete, isDeleting }: { loan: any, onVerCalendario: () => void, onDelete: () => void, isDeleting: boolean }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APROVADO': case 'Aprovado': case 'Ativo': return 'bg-[#34C759] text-white';
            case 'PENDENTE': case 'Pendente': return 'bg-[#FF9500] text-white';
            case 'REJEITADO': case 'Rejeitado': case 'Inadimplente': return 'bg-[#FF3B30] text-white';
            case 'PAGO': case 'Pago': return 'bg-[#007AFF] text-white';
            default: return 'bg-[#8E8E93] text-white';
        }
    };

    const total = Number(loan.valorTotal || loan.valor || 0);
    const pago = Number(loan.valorPago || 0);
    const progresso = total > 0 ? (pago / total) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] hover:shadow-lg transition-all group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-all group-hover:bg-[#007AFF]/5"></div>

            <div className="relative flex-1">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${getStatusColor(loan.status)} shadow-sm`}>
                            {loan.status || "DESCONHECIDO"}
                        </span>
                        <h3 className="text-2xl font-black text-[#1C1C1E] mt-3 tracking-tight">{Number(loan.valorPrincipal || loan.valor || 0).toLocaleString()} <span className="text-sm text-[#8E8E93]">MZN</span></h3>
                        <p className="text-xs text-[#8E8E93] font-bold uppercase tracking-wide mt-1">
                            {loan.cliente?.nome || `Cliente #${String(loan.clienteId || loan.id).substring(0, 8)}`}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-[#F2F2F7] rounded-2xl flex items-center justify-center group-hover:bg-[#007AFF] group-hover:text-white transition-all shadow-sm">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowConfirm(true);
                            }}
                            disabled={isDeleting || showConfirm}
                            className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${isDeleting || showConfirm ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}
                            title="Eliminar Empréstimo"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2 text-[#8E8E93]">
                        <span>Progresso de Pagamento</span>
                        <span>{progresso.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#F2F2F7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#34C759] rounded-full transition-all duration-1000" style={{ width: `${progresso}%` }}></div>
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F2F2F7] flex-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8E8E93] font-medium">Total a Pagar</span>
                        <span className="font-bold text-[#1C1C1E]">{Number(loan.valorTotal || loan.valor || 0).toLocaleString()} MZN</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8E8E93] font-medium">Parcela Mensal</span>
                        <span className="font-bold text-[#1C1C1E]">{Number(loan.valorParcelaMensal || 0).toLocaleString()} MZN</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8E8E93] font-medium">Data Início</span>
                        <span className="font-bold text-[#1C1C1E]">
                            {loan.dataInicio || loan.dataEmprestimo ? new Date(loan.dataInicio || loan.dataEmprestimo).toLocaleDateString('pt-PT') : "—"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8E8E93] font-medium">Data Vencimento</span>
                        <span className="font-bold text-[#1C1C1E]">
                            {loan.dataVencimento ? new Date(loan.dataVencimento).toLocaleDateString('pt-PT') : "—"}
                        </span>
                    </div>
                </div>

                {showConfirm && (
                    <div className="mt-4 bg-[#FF3B30]/5 border border-[#FF3B30] p-4 rounded-xl relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="font-bold text-[#1C1C1E] mb-2 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#FF3B30]" /> Atenção!
                        </p>
                        <p className="text-[10px] text-[#8E8E93] mb-4 leading-relaxed">
                            Esta ação eliminará este empréstimo e todos os seus dados: pagamentos, penalizações, penhores e testemunhas. Não pode ser desfeita.
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                                disabled={isDeleting} 
                                className="flex-1 py-2 bg-[#FF3B30] text-white rounded-lg font-bold text-[10px] hover:bg-[#D70015] flex justify-center items-center h-9 transition-colors shadow-sm"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }} 
                                disabled={isDeleting} 
                                className="flex-1 py-2 bg-white border border-[#E5E5EA] text-[#1C1C1E] rounded-lg font-bold text-[10px] hover:bg-[#F2F2F7] flex justify-center items-center h-9 transition-colors shadow-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F2F2F7]">
                <button
                    onClick={onVerCalendario}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-all"
                >
                    <Calendar className="w-4 h-4" />
                    Ver Calendário Financeiro
                </button>
            </div>
        </div>
    );
}
