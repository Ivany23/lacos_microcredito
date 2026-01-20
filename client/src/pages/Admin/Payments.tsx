import { AdminLayout } from "@/components/AdminLayout";
import { Receipt, Calendar, CreditCard, ChevronRight } from "lucide-react";

export default function AdminPayments() {
    return (
        <AdminLayout title="Pagamentos">
            <div className="space-y-8">
                <div className="space-y-1">
                    <h2 className="text-[34px] font-[900] text-[#1C1C1E] tracking-tight leading-tight">
                        Pagamentos
                    </h2>
                    <p className="text-[#8E8E93] font-semibold text-sm">
                        Fluxo de caixa e amortização de parcelas
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#34C759] p-8 rounded-[32px] text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col h-full">
                            <CreditCard className="w-8 h-8 mb-4 opacity-80" />
                            <p className="text-white/60 font-black text-xs uppercase tracking-widest mb-1">Receita Prevista (Hoje)</p>
                            <h3 className="text-3xl font-black tracking-tight">25.500,00 MZN</h3>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-[#E5E5EA] flex items-center justify-between group cursor-pointer hover:bg-[#F2F2F7] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F2F2F7] rounded-2xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-[#1C1C1E]" />
                            </div>
                            <div>
                                <p className="text-[#1C1C1E] font-bold">Agenda de Pagamentos</p>
                                <p className="text-[#8E8E93] text-xs font-semibold">Visualizar entradas por período</p>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-[#C7C7CC]" />
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-12 border border-[#E5E5EA] flex flex-col items-center justify-center text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="w-20 h-20 bg-[#F2F2F7] rounded-full flex items-center justify-center">
                        <Receipt className="w-10 h-10 text-[#AEAEB2]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#1C1C1E]">Conciliação Bancária</h3>
                        <p className="text-[#8E8E93] font-medium max-w-sm">
                            Registre pagamentos de M-Pesa, E-Mola ou Transferências diretamente nas fichas dos clientes.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
