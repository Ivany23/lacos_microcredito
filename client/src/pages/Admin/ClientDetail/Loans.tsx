import { Wallet, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function Loans({ data }: { data: any }) {
    const emprestimos = data.emprestimos || [];

    
    
    const penalizacoes = emprestimos.filter((e: any) => e.status === 'ATRASADO').map((e: any) => ({
        id: e.id,
        valor: e.valorTotal * 0.1, 
        motivo: "Atraso no pagamento",
        data: new Date().toISOString()
    }));

    return (
        <div className="space-y-8">
            {}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#007AFF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#1C1C1E]">Histórico de Empréstimos</h2>
                        <p className="text-sm text-[#8E8E93]">Todos os contratos realizados</p>
                    </div>
                </div>

                {emprestimos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {emprestimos.map((loan: any, index: number) => (
                            <LoanCard key={loan.emprestimoId || loan.id || index} loan={loan} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-[#F2F2F7] rounded-3xl border border-dashed border-[#AEAEB2]">
                        <Wallet className="w-12 h-12 text-[#AEAEB2] mx-auto mb-3 opacity-50" />
                        <p className="font-bold text-[#8E8E93]">Nenhum empréstimo encontrado.</p>
                    </div>
                )}
            </section>

            {}
            {penalizacoes.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#FF3B30] rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#1C1C1E]">Penalizações Ativas</h2>
                            <p className="text-sm text-[#8E8E93]">Multas e juros por atraso</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#FF3B30]/20 overflow-hidden">
                        {penalizacoes.map((pen: any, idx: number) => (
                            <div key={idx} className="p-4 border-b border-[#F2F2F7] last:border-0 hover:bg-[#FFF2F2] transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#FF3B30]"></div>
                                    <div>
                                        <p className="font-bold text-[#1C1C1E]">{pen.motivo}</p>
                                        <p className="text-xs text-[#8E8E93]">Ref. Empréstimo #{String(pen.id).substring(0, 8)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#FF3B30]">{Number(pen.valor || 0).toLocaleString()} MZN</p>
                                    <p className="text-xs font-medium text-[#8E8E93]">{new Date(pen.data).toLocaleDateString('pt-PT')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function LoanCard({ loan }: any) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APROVADO': return 'bg-[#34C759] text-white';
            case 'PENDENTE': return 'bg-[#FF9500] text-white';
            case 'REJEITADO': return 'bg-[#FF3B30] text-white';
            case 'PAGO': return 'bg-[#007AFF] text-white';
            default: return 'bg-[#8E8E93] text-white';
        }
    };

    
    const total = Number(loan.valorTotal || 0);
    const pago = 0; 
    const progresso = total > 0 ? (pago / total) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-all group-hover:bg-[#007AFF]/5"></div>

            <div className="relative">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${getStatusColor(loan.status)} shadow-sm`}>
                            {loan.status || "DESCONHECIDO"}
                        </span>
                        <h3 className="text-2xl font-black text-[#1C1C1E] mt-3 tracking-tight">{Number(loan.valorPrincipal || 0).toLocaleString()} <span className="text-sm text-[#8E8E93]">MZN</span></h3>
                        <p className="text-xs text-[#8E8E93] font-bold uppercase tracking-wide mt-1">Valor Solicitado</p>
                    </div>
                    <div className="w-12 h-12 bg-[#F2F2F7] rounded-2xl flex items-center justify-center group-hover:bg-[#007AFF] group-hover:text-white transition-all shadow-sm">
                        <Wallet className="w-6 h-6" />
                    </div>
                </div>

                {}
                <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2 text-[#8E8E93]">
                        <span>Progresso de Pagamento</span>
                        <span>{progresso.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#F2F2F7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#34C759] rounded-full transition-all duration-1000" style={{ width: `${progresso}%` }}></div>
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F2F2F7]">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8E8E93] font-medium">Total a Pagar</span>
                        <span className="font-bold text-[#1C1C1E]">{Number(loan.valorTotal || 0).toLocaleString()} MZN</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8E8E93] font-medium">Parcela Mensal</span>
                        <span className="font-bold text-[#1C1C1E]">{Number(loan.valorParcelaMensal || 0).toLocaleString()} MZN</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8E8E93] font-medium">Data Início</span>
                        <span className="font-bold text-[#1C1C1E]">
                            {loan.dataInicio ? new Date(loan.dataInicio).toLocaleDateString('pt-PT') : "—"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
