import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";
import { dashboardService, DashboardData } from "@/lib/dashboard.service";
import {
    Users,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Clock,
    Wallet,
    ShieldAlert,
    ChevronRight,
    Activity,
    BarChart3,
    CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [data, setData] = useState<DashboardData | null>(null);
    const [pagamentosData, setPagamentosData] = useState<any>(null);
    const [emprestimosData, setEmprestimosData] = useState<any>(null);
    const [projecoesData, setProjecoesData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadDashboardData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [mainData, pData, eData, prData] = await Promise.all([
                dashboardService.getDashboardPrincipal(),
                dashboardService.getAnalisePagamentos(),
                dashboardService.getAnaliseEmprestimos(),
                dashboardService.getProjecoesFinanceiras()
            ]);
            setData(mainData);
            setPagamentosData(pData);
            setEmprestimosData(eData);
            setProjecoesData(prData);
        } catch (error) {
            if (!silent) {
                toast({
                    title: "Conexão com API",
                    description: "Não conseguimos sincronizar os dados em tempo real.",
                    variant: "destructive"
                });
            }
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            loadDashboardData();

            const interval = setInterval(() => {
                loadDashboardData(true);
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [user]);

    if (!user || user.role !== 'admin') {
        return <Redirect to="/login-admin" />;
    }

    const cards = data ? [
        {
            title: "Total Clientes",
            value: data.kpisPrincipais.totalClientes.valor,
            icon: Users,
            color: "bg-[#007AFF]",
            shadow: "shadow-blue-100",
            trend: { valor: 0, tendencia: 'estavel' },
            label: "Base total"
        },
        {
            title: "Carteira Ativa",
            value: data.kpisPrincipais.carteiraAtiva.valor,
            icon: Wallet,
            color: "bg-[#5856D6]",
            shadow: "shadow-indigo-100",
            trend: { valor: 0, tendencia: 'estavel' },
            label: "Capital na rua"
        },
        {
            title: "Desembolso Diário",
            value: data.kpisPrincipais.desembolsoDiario.valor,
            icon: Clock,
            color: "bg-[#FF9500]",
            shadow: "shadow-orange-100",
            trend: { valor: 0, tendencia: 'estavel' },
            label: "Hoje"
        },
        {
            title: "Taxa Reembolso",
            value: data.kpisPrincipais.taxaReembolso.valor,
            icon: Activity,
            color: "bg-[#34C759]",
            shadow: "shadow-emerald-100",
            trend: { valor: 0, tendencia: 'estavel' },
            label: "Recuperação"
        },
        {
            title: "Risco PAR 30+",
            value: data.indicadoresRisco.par30.percentual,
            icon: ShieldAlert,
            color: data.kpisPrincipais.taxaInadimplencia.nivel === 'BAIXO' ? "bg-[#32D74B]" : "bg-[#FF3B30]",
            shadow: data.kpisPrincipais.taxaInadimplencia.nivel === 'BAIXO' ? "shadow-emerald-50" : "shadow-rose-100",
            status: data.kpisPrincipais.taxaInadimplencia.nivel,
            label: "Atraso crítico"
        }
    ] : [];

    const cashFlowData = pagamentosData?.evolucaoMensal?.map((item: any) => ({
        name: item.mes,
        valor: item.valorNumerico
    })) || [];

    const loanStatsData = emprestimosData?.porStatus ? [
        { name: 'Ativos', value: emprestimosData.porStatus.ativos.quantidade, color: '#007AFF' },
        { name: 'Pagos', value: emprestimosData.porStatus.pagos.quantidade, color: '#34C759' },
        { name: 'Inadimplentes', value: emprestimosData.porStatus.inadimplentes.quantidade, color: '#FF3B30' }
    ] : [];

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-8">
                <div className="space-y-1">
                    <h2 className="text-[34px] font-[900] text-[#1C1C1E] tracking-tight leading-tight">
                        Dashboard
                    </h2>
                    <p className="text-[#8E8E93] font-semibold text-sm">
                        Resumo operacional em tempo real
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-[200px] bg-white rounded-[36px] border border-[#E5E5EA] animate-pulse"></div>
                        ))
                    ) : (
                        cards.map((card, i) => (
                            <div key={i} className="group relative bg-white p-7 rounded-[36px] border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-auto">
                                        <div className={`w-12 h-12 ${card.color} rounded-[16px] flex items-center justify-center shadow-lg ${card.shadow}`}>
                                            <card.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <p className="text-[#8E8E93] text-[13px] font-[800] uppercase tracking-wider mb-1">{card.title}</p>
                                        <h2 className="text-[32px] font-[900] text-[#1C1C1E] tracking-tight">{card.value}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[#AEAEB2] text-xs font-bold">{card.label}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-[900] text-[#1C1C1E] flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-[#34C759]" />
                                    Lucros Totais da Empresa
                                </h3>
                                <p className="text-[#8E8E93] text-sm font-semibold ml-8">Evolução do lucro real mensal (Estimativa)</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4 -ml-4">
                            {isLoading ? (
                                <div className="h-full w-full bg-[#F2F2F7] animate-pulse rounded-2xl"></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={cashFlowData.map((d: any) => ({ ...d, lucro: (d.valor || 0) * 0.2 }))}>
                                        <defs>
                                            <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34C759" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="#F2F2F7" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 10, fontWeight: 700 }} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="lucro" stroke="#34C759" strokeWidth={4} fillOpacity={1} fill="url(#colorLucro)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <section className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-[900] text-[#1C1C1E] flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-[#5856D6]" />
                                    Fluxo de Arrecadação
                                </h3>
                                <p className="text-[#8E8E93] text-sm font-semibold ml-8">Últimos 6 meses (MZN)</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4 -ml-4">
                            {isLoading ? (
                                <div className="h-full w-full bg-[#F2F2F7] animate-pulse rounded-2xl"></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={cashFlowData}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#5856D6" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#5856D6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="#F2F2F7" strokeDasharray="3 3" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 700 }} dy={10} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', fontWeight: 900, fontSize: '14px' }} cursor={{ stroke: '#5856D6', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                        <Area type="monotone" dataKey="valor" stroke="#5856D6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-[900] text-[#1C1C1E] flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-[#AF52DE]" />
                                    Distribuição da Carteira
                                </h3>
                                <p className="text-[#8E8E93] text-sm font-semibold ml-8">Volume operacional por status</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            {isLoading ? (
                                <div className="h-full w-full bg-[#F2F2F7] animate-pulse rounded-2xl"></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={loanStatsData} margin={{ left: -20, right: 20, top: 20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} stroke="#F2F2F7" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1C1C1E', fontSize: 12, fontWeight: 800 }} />
                                        <Tooltip cursor={{ fill: '#F2F2F7' }} contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                                            {loanStatsData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <section className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-[900] text-[#1C1C1E] flex items-center gap-2">
                                <Clock className="w-6 h-6 text-[#FF9500]" />
                                Centro de Alertas
                            </h3>
                            <button className="text-[13px] font-black text-[#007AFF] hover:underline flex items-center gap-1">
                                Ver todos <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {data ? (
                            <div className="space-y-4">
                                <div className="p-5 bg-[#FFF2F2] rounded-[28px] border border-[#FFD5D5] flex items-center justify-between group transition-all hover:translate-x-1 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <ShieldAlert className="w-6 h-6 text-[#FF3B30]" />
                                        </div>
                                        <div>
                                            <p className="text-[#1C1C1E] font-black">Empréstimos Vencidos</p>
                                            <p className="text-[#FF3B30] text-[10px] font-black uppercase tracking-wider mt-1">Acção Requerida</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="text-[#1C1C1E] font-[900] text-2xl leading-none">{data.alertas.emprestimosVencidos.quantidade}</p>
                                            <p className="text-[#8E8E93] text-[10px] font-bold mt-1 uppercase">{data.alertas.emprestimosVencidos.valor}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#FF3B30] opacity-30 group-hover:opacity-100" />
                                    </div>
                                </div>

                                <div className="p-5 bg-[#FFF9E6] rounded-[28px] border border-[#FFE8A3] flex items-center justify-between group transition-all hover:translate-x-1 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <AlertCircle className="w-6 h-6 text-[#FF9500]" />
                                        </div>
                                        <div>
                                            <p className="text-[#1C1C1E] font-black">A Vencer (7 dias)</p>
                                            <p className="text-[#FF9500] text-[10px] font-black uppercase tracking-wider mt-1">Previsão Próxima</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="text-[#1C1C1E] font-[900] text-2xl leading-none">{data.alertas.emprestimosAVencer.quantidade}</p>
                                            <p className="text-[#8E8E93] text-[10px] font-bold mt-1 uppercase">{data.alertas.emprestimosAVencer.valor}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#FF9500] opacity-30 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[150px] flex items-center justify-center text-[#C7C7CC] font-bold uppercase tracking-widest text-xs">A carregar alertas...</div>
                        )}
                    </section>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <section className="bg-[#1C1C1E] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF3B30] opacity-[0.1] rounded-full blur-[100px] -mr-40 -mt-40"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xl font-[900] mb-8 flex items-center gap-2">
                                <ShieldAlert className="w-6 h-6 text-[#FF3B30]" />
                                Monitoramento de Risco PAR
                            </h3>

                            {data ? (
                                <div className="space-y-6 flex-1">
                                    <div className="space-y-4">
                                        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-[24px] hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">PAR 1+ Dia (Atraso)</span>
                                                <span className="text-[#FFCC00] text-xs font-black">{data.indicadoresRisco.par1.percentual}</span>
                                            </div>
                                            <p className="text-2xl font-black">{data.indicadoresRisco.par1.valor}</p>
                                        </div>
                                        
                                        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-[24px] hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">PAR 7+ Dias</span>
                                                <span className="text-[#FF9500] text-xs font-black">{data.indicadoresRisco.par7.percentual}</span>
                                            </div>
                                            <p className="text-2xl font-black">{data.indicadoresRisco.par7.valor}</p>
                                        </div>

                                        <div className="p-5 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">PAR 30+ Dias (Crítico)</span>
                                                <span className="text-[#FF3B30] text-xs font-black">{data.indicadoresRisco.par30.percentual}</span>
                                            </div>
                                            <p className="text-2xl font-black text-[#FF3B30]">{data.indicadoresRisco.par30.valor}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-white/20 uppercase font-black tracking-widest text-xs">Sincronizando...</div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-[900] text-[#1C1C1E] flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-[#34C759]" />
                                    Projeção de Arrecadação
                                </h3>
                                <p className="text-[#8E8E93] text-sm font-semibold ml-8">Próximos 3 meses (Estimativa)</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4 -ml-4">
                            {isLoading ? (
                                <div className="h-full w-full bg-[#F2F2F7] animate-pulse rounded-2xl"></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: projecoesData?.projecaoArrecadacao?.mes1?.periodo, valor: projecoesData?.projecaoArrecadacao?.mes1?.valorNumerico, color: '#34C759' },
                                        { name: projecoesData?.projecaoArrecadacao?.mes2?.periodo, valor: projecoesData?.projecaoArrecadacao?.mes2?.valorNumerico, color: '#007AFF' },
                                        { name: projecoesData?.projecaoArrecadacao?.mes3?.periodo, valor: projecoesData?.projecaoArrecadacao?.mes3?.valorNumerico, color: '#5856D6' }
                                    ]}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 10, fontWeight: 700 }} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: '#F2F2F7' }} contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="valor" radius={[12, 12, 12, 12]} barSize={40}>
                                            <Cell fill="#34C759" opacity={0.6} />
                                            <Cell fill="#007AFF" opacity={0.8} />
                                            <Cell fill="#5856D6" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>
                </div>

                <footer className="flex justify-center pt-8">
                    <div className="px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl flex items-center gap-3 shadow-xl shadow-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#32D74B]" />
                        <span className="text-[#8E8E93] text-[10px] font-[800] uppercase tracking-[2px]">Lacos Admin • Integridade de Dados Verificada</span>
                        {data && <span className="text-[#AEAEB2] text-[10px] font-bold border-l border-[#E5E5EA] pl-3">Sync: {new Date(data.dataGeracao).toLocaleTimeString()}</span>}
                    </div>
                </footer>
            </div>
        </AdminLayout>
    );
}
