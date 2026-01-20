import { AdminLayout } from "@/components/AdminLayout";
import { Wallet, Search, Filter, ArrowUpRight } from "lucide-react";

export default function AdminLoans() {
    return (
        <AdminLayout title="Empréstimos">
            <div className="space-y-8">
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
                        <button className="h-12 px-6 bg-[#007AFF] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-[#0066D6] transition-all active:scale-95">
                            Nova Proposta
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['Todos', 'Ativos', 'Atrasados', 'Liquidados'].map((filter, i) => (
                        <button
                            key={i}
                            className={`h-14 rounded-2xl font-bold transition-all ${i === 0
                                    ? "bg-[#1C1C1E] text-white"
                                    : "bg-white border border-[#E5E5EA] text-[#8E8E93] hover:border-[#007AFF] hover:text-[#007AFF]"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[40px] p-12 border border-[#E5E5EA] flex flex-col items-center justify-center text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="w-20 h-20 bg-[#F2F2F7] rounded-full flex items-center justify-center">
                        <Wallet className="w-10 h-10 text-[#AEAEB2]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#1C1C1E]">Monitoramento de Carteira</h3>
                        <p className="text-[#8E8E93] font-medium max-w-sm">
                            Visualize a saúde de cada empréstimo, calcule juros automaticamente e emita relatórios de cobrança.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
