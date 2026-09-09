import { Wallet, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Calendar, Bell, X, FileText, Eye, Download } from "lucide-react";
import { useState } from "react";
import { clientDetailService } from "@/lib/client-detail.service";
import { useToast } from "@/hooks/use-toast";

import { API_BASE_URL } from "@/lib/api.config";


export default function Overview({ data }: { data: any }) {
    const { toast } = useToast();
    const dashboard = data.dashboard || {};
    const { financeiro, status, grafico } = dashboard;
    const notificacoes = Array.isArray(data.notificacoes) ? data.notificacoes : [];

    const [selectedNotification, setSelectedNotification] = useState<any>(null);

    const handleOpenNotification = (note: any) => {
        setSelectedNotification(note);
    };

    const handleDownloadDocument = async (docId: string, fileName: string, isView = false) => {
        try {
            const blob = await clientDetailService.getDocumentFile(docId);
            const url = window.URL.createObjectURL(blob);
            if (isView) {
                window.open(url, '_blank');
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const dividaTotal = financeiro?.dividaTotal || 0;
    const totalPenalizacoes = financeiro?.totalPenalizacoes || 0;
    const totalPago = financeiro?.totalPago || 0;

    const ativosCount = status?.ativos || 0;
    const atrasadosCount = status?.atrasados || 0;
    const score = status?.score || 0;

    const nextPayment = status?.nextPayment ? {
        ...status.nextPayment,
        data: new Date(status.nextPayment.data)
    } : null;

    const chartData = Array.isArray(grafico) ? grafico : [];
    const maxChartVal = Math.max(...chartData.map((d: any) => Math.max(d.valorPago || 0, d.valorEmprestado || 0)), 1000);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedNotification(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#1C1C1E]">Notificação</h3>
                                    <p className="text-sm text-[#8E8E93]">{new Date(selectedNotification.dataEnvio).toLocaleString('pt-PT')}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-[#F2F2F7] rounded-full transition-colors">
                                <X className="w-5 h-5 text-[#8E8E93]" />
                            </button>
                        </div>

                        <div className="bg-[#F2F2F7] rounded-2xl p-4 mb-6">
                            <p className="text-[#1C1C1E] font-medium leading-relaxed">{selectedNotification.mensagem}</p>
                        </div>

                        <button onClick={() => setSelectedNotification(null)} className="w-full py-3 bg-[#1C1C1E] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {nextPayment && nextPayment.atrasado && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-600 w-5 h-5" />
                        <div>
                            <p className="font-bold text-red-900 text-sm">Atenção Necessária</p>
                            <p className="text-red-700 text-xs">Existem contratos com vencimento expirado que requerem ação imediata.</p>
                        </div>
                    </div>
                    <span className="bg-red-200 text-red-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Urgente</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Saldo Devedor"
                    value={`${dividaTotal.toLocaleString()} MZN`}
                    subValue={totalPenalizacoes > 0 ? `+ ${totalPenalizacoes.toLocaleString()} MZN em Multas` : "Sem multas ativas"}
                    icon={DollarSign}
                    color="bg-[#FF9500]"
                    alert={dividaTotal > 0 && atrasadosCount > 0}
                />

                <SummaryCard
                    title="Empréstimos Ativos"
                    value={ativosCount.toString()}
                    subValue={atrasadosCount > 0 ? `${atrasadosCount} Atrasado(s)` : "Todos regulares"}
                    icon={Wallet}
                    color="bg-[#007AFF]"
                />

                <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5EA] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${score < 50 ? 'bg-red-500' : 'bg-green-500'}`}>
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] bg-[#F2F2F7] font-bold text-[#8E8E93] px-2 py-1 rounded-full">Score</span>
                    </div>
                    <div className="z-10 mt-4">
                        <p className="text-[#8E8E93] text-xs font-bold uppercase tracking-wide mb-1">Reputação de Crédito</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black ${score < 50 ? 'text-red-500' : 'text-green-500'}`}>{score}</span>
                            <span className="text-sm font-bold text-[#D1D1D6]">/100</span>
                        </div>
                    </div>
                </div>

                {nextPayment ? (
                    <div className="bg-[#1C1C1E] p-6 rounded-[2rem] shadow-xl relative overflow-hidden text-white flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                        <div className="flex justify-between items-start z-10">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            {nextPayment.atrasado && <span className="bg-red-600 text-[10px] font-bold px-2 py-1 rounded-sm">VENCIDO</span>}
                        </div>
                        <div className="z-10 mt-4">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wide mb-1">{nextPayment.atrasado ? "Venceu dia" : "Próximo Vencimento"}</p>
                            <p className="text-2xl font-black tracking-tight">{nextPayment.data.toLocaleDateString('pt-PT')}</p>
                            <p className="text-white/40 text-[10px] mt-1">Ref. Contrato #{String(nextPayment.id).substring(0, 6)}</p>
                        </div>
                    </div>
                ) : (
                    <SummaryCard
                        title="Total Amortizado"
                        value={`${totalPago.toLocaleString()} MZN`}
                        subValue="Histórico completo"
                        icon={CheckCircle2}
                        color="bg-[#34C759]"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-[#E5E5EA] shadow-sm flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="font-bold text-[#1C1C1E] text-xl">Fluxo Financeiro</h3>
                                <p className="text-[#8E8E93] text-sm font-medium">Histórico de 6 Meses</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]"></div><span className="text-xs font-bold text-[#8E8E93]">Crédito</span></div>
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#34C759]"></div><span className="text-xs font-bold text-[#8E8E93]">Pagamentos</span></div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-4 px-2">
                            {chartData.map((bar, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 w-full h-full justify-end group">
                                    <div className="w-full relative h-[90%] flex items-end justify-center rounded-2xl bg-[#F2F2F7]/50 p-1 gap-1">
                                        <div className="w-1/2 rounded-t-lg bg-[#007AFF] relative transition-all hover:opacity-80" style={{ height: `${(bar.valorEmprestado / maxChartVal) * 100}%` }}></div>
                                        <div className="w-1/2 rounded-t-lg bg-[#34C759] relative transition-all hover:opacity-80" style={{ height: `${(bar.valorPago / maxChartVal) * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#8E8E93] uppercase">{bar.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">

                        {notificacoes.length > 0 && (
                            <div className="bg-white rounded-[2rem] p-8 border border-[#E5E5EA] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#1C1C1E] text-xl">Notificações</h3>
                                            <p className="text-[#8E8E93] text-xs font-medium">Avisos e comunicados importantes</p>
                                        </div>
                                    </div>
                                    <span className="bg-[#F2F2F7] text-[#8E8E93] text-xs font-bold px-3 py-1 rounded-full">{notificacoes.length} News</span>
                                </div>

                                <div className="space-y-3">
                                    {notificacoes.slice(0, 3).map((notif: any, idx: number) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleOpenNotification(notif)}
                                            className={`p-4 rounded-3xl border transition-all cursor-pointer flex gap-4 items-start group hover:scale-[1.01]
                                            ${notif.status === 'Lida'
                                                    ? 'bg-white border-[#E5E5EA] hover:bg-[#F2F2F7]'
                                                    : 'bg-orange-50/30 border-orange-100 hover:bg-orange-50'
                                                }`}
                                        >
                                            <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 transition-colors ${notif.status === 'Lida' ? 'bg-[#E5E5EA]' : 'bg-[#FF9500]'}`}></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`text-sm font-bold ${notif.status === 'Lida' ? 'text-[#8E8E93]' : 'text-[#1C1C1E]'}`}>{notif.tipo || "Aviso do Sistema"}</p>
                                                    <span className="text-[10px] font-bold text-[#AEAEB2]">{new Date(notif.dataEnvio).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-[#8E8E93] line-clamp-2 group-hover:text-[#1C1C1E] transition-colors leading-relaxed">{notif.mensagem}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[2rem] p-8 border border-[#E5E5EA] shadow-sm hidden">

                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-[#E5E5EA] shadow-sm">
                        <h3 className="font-bold text-[#8E8E93] text-xs uppercase tracking-wide mb-4">Detalhes da Conta</h3>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-3 h-3 rounded-full ${data.autenticacao?.bloqueado ? 'bg-[#FF3B30] animate-pulse' : 'bg-[#34C759]'}`}></div>
                            <span className="font-black text-[#1C1C1E] text-lg">{data.autenticacao?.bloqueado ? 'BLOQUEADA' : 'EM DIA'}</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-[#F2F2F7]">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Cadastro</span>
                                <span className="text-sm font-bold text-[#1C1C1E]">{new Date(data.dataCadastro).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#F2F2F7]">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Renda</span>
                                <span className="text-sm font-bold text-[#1C1C1E]">{Number(data.ocupacoes?.[0]?.rendaMinima || 0).toLocaleString()} MZN</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1C1C1E] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
                        <h3 className="font-bold text-white/40 text-xs uppercase tracking-wide mb-2">Localização</h3>
                        <p className="text-2xl font-bold tracking-tight mb-1">{data.localizacao?.cidade || "N/A"}</p>
                        <p className="text-white/60 text-sm font-medium">{data.localizacao?.bairro || "..."}</p>
                    </div>

                    {data.documentos?.[0] && (
                        <div className="bg-white rounded-[2rem] p-6 border border-[#E5E5EA] shadow-sm">
                            <h3 className="font-bold text-[#8E8E93] text-xs uppercase tracking-wide mb-4">Documento Identificação</h3>
                            <div className="flex items-center justify-between p-4 bg-[#F2F2F7] rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#007AFF]/10 rounded-xl flex items-center justify-center text-[#007AFF]">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#1C1C1E]">{data.documentos[0].tipoDocumento}</p>
                                        <p className="text-[10px] text-[#8E8E93] font-medium">Ref: {data.documentos[0].numeroDocumento.substring(0, 10)}...</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownloadDocument(data.documentos[0].documentoId, `doc_${data.documentos[0].numeroDocumento}`, true)}
                                        className="p-2 bg-white hover:bg-white/80 rounded-xl shadow-sm transition-all text-[#1C1C1E] flex items-center justify-center"
                                        title="Visualizar"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownloadDocument(data.documentos[0].documentoId, `doc_${data.documentos[0].numeroDocumento}`, false)}
                                        className="p-2 bg-[#007AFF] hover:bg-[#007AFF]/90 rounded-xl shadow-sm transition-all text-white flex items-center justify-center"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, subValue, icon: Icon, color, alert }: any) {
    return (
        <div className={`bg-white p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between min-h-[160px] group
            ${alert ? 'border-red-200 shadow-red-100 shadow-lg' : 'border-[#E5E5EA] shadow-sm hover:shadow-md'}`}>

            <div className="flex justify-between items-start z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {alert && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>}
            </div>

            <div className="z-10 mt-4">
                <p className="text-[#8E8E93] text-xs font-bold uppercase tracking-wide mb-1 opacity-80">{title}</p>
                <p className="text-3xl font-black text-[#1C1C1E] tracking-tighter">{value}</p>
                {subValue && <p className={`text-[10px] font-bold mt-1 ${alert ? 'text-red-500' : 'text-[#8E8E93]'}`}>{subValue}</p>}
            </div>

            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-5 ${color} transition-transform group-hover:scale-110`}></div>
        </div>
    );
}
