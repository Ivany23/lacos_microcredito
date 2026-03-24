import { AdminLayout } from "@/components/AdminLayout";
import { 
    Receipt, 
    Calendar, 
    CreditCard, 
    ChevronRight, 
    Plus, 
    Search, 
    Smartphone, 
    Banknote, 
    Building2,
    CheckCircle2,
    Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { paymentsService, Pagamento } from "@/lib/payments.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";

export default function AdminPayments() {
    const { toast } = useToast();
    const [payments, setPayments] = useState<Pagamento[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [clientLoans, setClientLoans] = useState<any[]>([]);
    const [selectedLoan, setSelectedLoan] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        valorPago: "",
        metodoPagamento: "M-Pesa",
        referenciaPagamento: ""
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [pList, cList] = await Promise.all([
                paymentsService.getAll(),
                paymentsService.searchClients()
            ]);
            setPayments(pList);
            setClients(cList);
        } catch (error) {
            toast({
                title: "Erro de Sincronização",
                description: "Não foi possível carregar os dados financeiros.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            paymentsService.getLoansByClient(selectedClient)
                .then(loans => setClientLoans(loans.filter(l => l.status !== 'Pago')))
                .catch(() => setClientLoans([]));
        } else {
            setClientLoans([]);
        }
    }, [selectedClient]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan || !form.valorPago) {
            toast({ title: "Dados Incompletos", description: "Selecione o empréstimo e o valor.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            await paymentsService.registerDaily({
                emprestimoId: selectedLoan,
                valorPago: Number(form.valorPago),
                metodoPagamento: form.metodoPagamento,
                referenciaPagamento: form.referenciaPagamento
            });
            toast({ title: "Pagamento Registrado", description: "O saldo devedor foi atualizado." });
            setForm({ valorPago: "", metodoPagamento: "M-Pesa", referenciaPagamento: "" });
            setSelectedClient("");
            setSelectedLoan("");
            loadData();
        } catch (error: any) {
            toast({
                title: "Falha no Registro",
                description: error.response?.data?.message || "Erro ao processar pagamento.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getDailyTotalByMethod = (category: string) => {
        const today = new Date().toISOString().split('T')[0];
        const mobileWallets = ['M-Pesa', 'e-Mola', 'mKesh'];
        const bankMethods = ['Millennium bim', 'BCI', 'Standard Bank', 'Absa Bank', 'Moza Banco', 'Nedbank', 'Outro Banco'];
        
        return payments
            .filter(p => {
                const isToday = p.dataPagamento.startsWith(today);
                if (!isToday) return false;
                
                if (category === 'Móvel') return mobileWallets.includes(p.metodoPagamento);
                if (category === 'Bancos') return bankMethods.includes(p.metodoPagamento);
                if (category === 'Numerário') return p.metodoPagamento === 'Numerário';
                return false;
            })
            .reduce((sum, p) => sum + Number(p.valorPago), 0);
    };

    const formatMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor);
    };

    return (
        <AdminLayout title="Pagamentos">
            <div className="space-y-10 animate-fade-in">
                <div className="space-y-2">
                    <h2 className="text-[34px] font-[950] text-[#1C1C1E] tracking-tight leading-tight uppercase">
                        Operações de Caixa
                    </h2>
                    <p className="text-[#8E8E93] font-bold text-sm tracking-wide">
                        SISTEMA DE CONCILIAÇÃO BANCÁRIA E ARRECADAÇÃO DIÁRIA
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'C. Móveis (M-Pesa/e-Mola)', icon: Smartphone, color: 'bg-[#E30613]', value: getDailyTotalByMethod('Móvel') },
                        { label: 'Bancos (bim/BCI/etc)', icon: Building2, color: 'bg-[#004A99]', value: getDailyTotalByMethod('Bancos') },
                        { label: 'Numerário (Físico)', icon: Banknote, color: 'bg-[#34C759]', value: getDailyTotalByMethod('Numerário') }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 ${item.color} rounded-2xl flex items-center justify-center`}>
                                    <item.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[#8E8E93] font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                            </div>
                            <p className="text-xl font-[900] text-[#1C1C1E]">{formatMoeda(item.value)}</p>
                            <p className="text-[9px] text-[#8E8E93] font-bold mt-1 uppercase">Total arrecadado hoje</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1">
                        <div className="bg-white p-8 rounded-[40px] border border-[#E5E5EA] shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-[#F2F2F7] rounded-2xl flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-[#1C1C1E]" />
                                </div>
                                <h3 className="text-lg font-black text-[#1C1C1E] uppercase tracking-tight">Novo Recebimento</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-1">Cliente</label>
                                    <select 
                                        className="w-full h-12 px-4 rounded-xl bg-[#F2F2F7] border-none text-sm font-bold focus:ring-2 focus:ring-[#007AFF] outline-none"
                                        value={selectedClient}
                                        onChange={(e) => setSelectedClient(e.target.value)}
                                    >
                                        <option value="">Selecionar Cliente...</option>
                                        {clients.map(c => (
                                            <option key={c.clienteId} value={c.clienteId}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedClient && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-1">Contrato/Empréstimo</label>
                                        <select 
                                            className="w-full h-12 px-4 rounded-xl bg-[#F2F2F7] border-none text-sm font-bold focus:ring-2 focus:ring-[#007AFF] outline-none"
                                            value={selectedLoan}
                                            onChange={(e) => setSelectedLoan(e.target.value)}
                                        >
                                            <option value="">Selecionar Contrato...</option>
                                            {clientLoans.map(l => (
                                                <option key={l.emprestimoId} value={l.emprestimoId}>
                                                    #{l.emprestimoId} - {formatMoeda(Number(l.valor))} ({l.status})
                                                </option>
                                            ))}
                                            {clientLoans.length === 0 && <option disabled>Nenhum empréstimo ativo</option>}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-1">Método de Pagamento</label>
                                        <select 
                                            className="w-full h-12 px-4 rounded-xl bg-[#F2F2F7] border-none text-sm font-bold focus:ring-2 focus:ring-[#007AFF] outline-none"
                                            value={form.metodoPagamento}
                                            onChange={(e) => setForm({...form, metodoPagamento: e.target.value})}
                                        >
                                            <optgroup label="Carteiras Móveis">
                                                <option value="M-Pesa">M-Pesa (Vodacom)</option>
                                                <option value="e-Mola">e-Mola (Movitel)</option>
                                                <option value="mKesh">mKesh (Tmcel)</option>
                                            </optgroup>
                                            <optgroup label="Bancos (Moçambique)">
                                                <option value="Millennium bim">Millennium bim</option>
                                                <option value="BCI">BCI</option>
                                                <option value="Standard Bank">Standard Bank</option>
                                                <option value="Absa Bank">Absa Bank</option>
                                                <option value="Moza Banco">Moza Banco</option>
                                                <option value="Nedbank">Nedbank</option>
                                                <option value="Outro Banco">Outro Banco / Transferência</option>
                                            </optgroup>
                                            <optgroup label="Físico">
                                                <option value="Numerário">Numerário (Físico/Cash)</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-1">Valor (MZN)</label>
                                        <Input 
                                            type="number"
                                            placeholder="0,00"
                                            className="h-12 bg-[#F2F2F7] border-none font-bold rounded-xl"
                                            value={form.valorPago}
                                            onChange={(e) => setForm({...form, valorPago: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-1">Referência Transação (Opcional)</label>
                                    <Input 
                                        placeholder="Ex: MP230491..."
                                        className="h-12 bg-[#F2F2F7] border-none font-bold rounded-xl"
                                        value={form.referenciaPagamento}
                                        onChange={(e) => setForm({...form, referenciaPagamento: e.target.value})}
                                    />
                                </div>

                                <Button 
                                    disabled={submitting}
                                    className="w-full h-14 bg-[#007AFF] hover:bg-[#0063CC] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all mt-4"
                                >
                                    {submitting ? "Processando..." : "Confirmar Recebimento"}
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-[40px] border border-[#E5E5EA] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-[#F2F2F7] flex items-center justify-between">
                                <h3 className="text-lg font-black text-[#1C1C1E] uppercase tracking-tight">Transações Recentes</h3>
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F2F7] rounded-xl text-[11px] font-black uppercase text-[#8E8E93]">
                                    <Clock className="w-3.5 h-3.5" />
                                    Últimos 50 Registros
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-[#F9F9F9] hover:bg-[#F9F9F9]">
                                            <TableHead className="text-[10px] font-black uppercase text-[#8E8E93] h-14">Data</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-[#8E8E93]">Cliente</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-[#8E8E93]">Método</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-[#8E8E93]">Referência</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-[#8E8E93] text-right px-8">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center text-[#8E8E93] font-semibold italic">
                                                    Nenhum pagamento registrado ainda.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            payments.slice(0, 50).map((p) => (
                                                <TableRow key={p.pagamentoId} className="hover:bg-[#F2F2F7] transition-colors border-b border-[#F2F2F7]">
                                                    <TableCell className="text-xs font-bold text-[#1C1C1E]">
                                                        {new Date(p.dataPagamento).toLocaleDateString('pt-MZ')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-bold text-sm text-[#1C1C1E]">{p.cliente?.nome || '---'}</p>
                                                        <p className="text-[10px] text-[#8E8E93] font-bold">L-#{p.emprestimoId}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                                                            ['M-Pesa', 'e-Mola', 'mKesh'].includes(p.metodoPagamento) ? 'bg-red-50 text-red-600' :
                                                            p.metodoPagamento === 'Numerário' ? 'bg-green-50 text-green-600' :
                                                            'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            {p.metodoPagamento}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-[11px] font-mono text-[#8E8E93] uppercase">
                                                        {p.referenciaPagamento}
                                                    </TableCell>
                                                    <TableCell className="text-right px-8 font-[950] text-[#1C1C1E]">
                                                        {formatMoeda(Number(p.valorPago))}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
