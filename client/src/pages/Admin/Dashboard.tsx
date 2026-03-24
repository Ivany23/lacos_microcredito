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

import { motion } from "framer-motion";

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
            title: "Capital Emprestado",
            value: data.kpisPrincipais.capitalEmprestado.valor,
            icon: Wallet,
            color: "bg-gradient-to-br from-[#007AFF] to-[#00C6FF]",
            shadow: "shadow-blue-200/50",
            trend: data.desempenhoMensal.variacoes.emprestimos,
            label: "Fluxo total"
        },
        {
            title: "Lucro Realizado",
            value: data.kpisPrincipais.lucroRealizado.valor,
            icon: TrendingUp,
            color: "bg-gradient-to-br from-[#34C759] to-[#30D158]",
            shadow: "shadow-emerald-200/50",
            trend: data.desempenhoMensal.variacoes.pagamentos,
            label: "Margem de 20%"
        },
        {
            title: "Risco da Carteira",
            value: data.kpisPrincipais.taxaInadimplencia.valor,
            icon: ShieldAlert,
            color: data.kpisPrincipais.taxaInadimplencia.nivel === 'BAIXO' ? "bg-gradient-to-br from-[#32D74B] to-[#28CD41]" : "bg-gradient-to-br from-[#FF3B30] to-[#FF453A]",
            shadow: data.kpisPrincipais.taxaInadimplencia.nivel === 'BAIXO' ? "shadow-emerald-100/50" : "shadow-rose-200/50",
            status: data.kpisPrincipais.taxaInadimplencia.nivel,
            label: "Taxa de atraso"
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <AdminLayout title="Dashboard">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <motion.h2 
                            variants={itemVariants}
                            className="text-[34px] font-[900] text-[#1C1C1E] tracking-tight leading-tight"
                        >
                            Dashboard
                        </motion.h2>
                        <motion.p 
                            variants={itemVariants}
                            className="text-[#8E8E93] font-semibold text-sm"
                        >
                            Resumo operacional em tempo real
                        </motion.p>
                    </div>

                    <motion.div 
                        variants={itemVariants}
                        className="flex items-center p-1 bg-[#F2F2F7] rounded-2xl border border-[#E5E5EA]"
                    >
                        {['7D', '30D', '90D', 'TUDO'].map((period) => (
                            <button 
                                key={period}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    period === '30D' ? 'bg-white shadow-sm text-[#007AFF]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                                }`}
                            >
                                {period}
                            </button>
                        ))}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-[200px] bg-white rounded-[36px] border border-[#E5E5EA] animate-pulse"></div>
                        ))
                    ) : (
                        cards.map((card, i) => (
                            <motion.div 
                                key={i} 
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.01 }}
                                className="group relative bg-white p-7 rounded-[36px] border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden cursor-default"
                            >
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-auto">
                                        <div className={`w-12 h-12 ${card.color} rounded-[16px] flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                                            <card.icon className="w-6 h-6 text-white" />
                                        </div>
                                        {card.trend && (
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${card.trend.tendencia === 'alta' ? 'bg-[#EAF9EE] text-[#248A3D]' :
                                                    card.trend.tendencia === 'baixa' ? 'bg-[#FEEBEC] text-[#D1272F]' : 'bg-[#F2F2F7] text-[#636366]'
                                                }`}>
                                                {card.trend.tendencia === 'alta' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                {Math.abs(card.trend.valor)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-8">
                                        <p className="text-[#8E8E93] text-[13px] font-[800] uppercase tracking-wider mb-1 opacity-70 group-hover:opacity-100 transition-opacity">{card.title}</p>
                                        <h2 className="text-[32px] font-[900] text-[#1C1C1E] tracking-tight">{card.value}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[#AEAEB2] text-xs font-bold">{card.label}</span>
                                            {card.status && (
                                                <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${card.status === 'BAIXO' ? 'bg-[#E3F2FD] text-[#007AFF]' : 'bg-[#FFF3E0] text-[#FF9500]'
                                                    }`}>
                                                    {card.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <motion.section 
                        variants={itemVariants}
                        className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-shadow duration-500"
                    >
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
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '20px', 
                                                border: 'none', 
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(10px)',
                                                fontWeight: 900, 
                                                fontSize: '14px',
                                                padding: '12px 16px'
                                            }} 
                                            cursor={{ stroke: '#5856D6', strokeWidth: 2, strokeDasharray: '4 4' }} 
                                        />
                                        <Area type="monotone" dataKey="valor" stroke="#5856D6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.section>

                    <motion.section 
                        variants={itemVariants}
                        className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-shadow duration-500"
                    >
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
                                        <Tooltip 
                                            cursor={{ fill: '#F2F2F7', radius: 12 }} 
                                            contentStyle={{ 
                                                borderRadius: '20px', 
                                                border: 'none', 
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(10px)',
                                                padding: '12px 16px'
                                            }} 
                                        />
                                        <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                                            {loanStatsData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.section>

                    <motion.section 
                        variants={itemVariants}
                        className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
                    >
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
                                <motion.div 
                                    whileHover={{ x: 8 }}
                                    className="p-5 bg-gradient-to-r from-[#FFF2F2] to-white rounded-[28px] border border-[#FFD5D5] flex items-center justify-between group transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
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
                                </motion.div>

                                <motion.div 
                                    whileHover={{ x: 8 }}
                                    className="p-5 bg-gradient-to-r from-[#FFF9E6] to-white rounded-[28px] border border-[#FFE8A3] flex items-center justify-between group transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
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
                                </motion.div>
                            </div>
                        ) : (
                            <div className="h-[150px] flex items-center justify-center text-[#C7C7CC] font-bold uppercase tracking-widest text-xs">A carregar alertas...</div>
                        )}
                    </motion.section>

                    <motion.section 
                        variants={itemVariants}
                        className="bg-[#1C1C1E] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl group"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5856D6] opacity-[0.2] rounded-full blur-[100px] -mr-40 -mt-40 group-hover:opacity-[0.3] transition-opacity duration-700"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xl font-[900] mb-8 flex items-center gap-2">
                                <Users className="w-6 h-6 text-[#007AFF]" />
                                Indicadores de Expansão
                            </h3>

                            {data ? (
                                <div className="space-y-8 flex-1">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-white/[0.05] border border-white/10 rounded-[28px] group-hover:bg-white/10 transition-all">
                                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mb-2">Total Clientes</p>
                                            <p className="text-[36px] font-black tracking-tighter leading-none">{data.kpisPrincipais.totalClientes.valor}</p>
                                            <div className="flex items-center gap-1 mt-3">
                                                <TrendingUp className="w-3 h-3 text-[#32D74B]" />
                                                <span className="text-[#32D74B] text-[10px] font-black">ACTIVE GROWTH</span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-white/[0.05] border border-white/10 rounded-[28px] group-hover:bg-white/10 transition-all">
                                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mb-2">Micro-créditos</p>
                                            <p className="text-[36px] font-black tracking-tighter leading-none text-[#007AFF]">{data.kpisPrincipais.totalClientes.clientesAtivos}</p>
                                            <p className="text-white/40 text-[10px] font-bold mt-3 uppercase">Contratos Vigentes</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        <div className="flex items-center justify-between text-[11px] font-black tracking-widest uppercase mb-3 text-white/70">
                                            <span>Estabilidade do Sistema</span>
                                            <span className="text-[#32D74B]">94.8% Eficiência</span>
                                        </div>
                                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-[2px]">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: '94.8%' }}
                                                transition={{ duration: 2, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-[#007AFF] to-[#32D74B] rounded-full shadow-[0_0_15px_rgba(50,215,75,0.4)]"
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-white/20 uppercase font-black tracking-widest text-xs">Sincronizando...</div>
                            )}
                        </div>
                    </motion.section>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <motion.section 
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-[40px] p-8 border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-[900] text-[#1C1C1E] flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-[#34C759]" />
                                    Projeção de Arrecadação
                                </h3>
                                <p className="text-[#8E8E93] text-sm font-semibold ml-8">Próximos 3 meses (Estimativa)</p>
                            </div>
                        </div>
                        <div className="h-[400px] w-full mt-4 -ml-4">
                            {isLoading ? (
                                <div className="h-full w-full bg-[#F2F2F7] animate-pulse rounded-2xl"></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: projecoesData?.projecaoArrecadacao?.mes1?.periodo, valor: projecoesData?.projecaoArrecadacao?.mes1?.valorNumerico, color: '#34C759' },
                                        { name: projecoesData?.projecaoArrecadacao?.mes2?.periodo, valor: projecoesData?.projecaoArrecadacao?.mes2?.valorNumerico, color: '#007AFF' },
                                        { name: projecoesData?.projecaoArrecadacao?.mes3?.periodo, valor: projecoesData?.projecaoArrecadacao?.mes3?.valorNumerico, color: '#5856D6' }
                                    ]}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 13, fontWeight: 700 }} />
                                        <YAxis hide />
                                        <Tooltip 
                                            cursor={{ fill: '#F2F2F7', radius: 12 }} 
                                            contentStyle={{ 
                                                borderRadius: '20px', 
                                                border: 'none', 
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(10px)',
                                                padding: '12px 16px'
                                            }} 
                                        />
                                        <Bar dataKey="valor" radius={[12, 12, 12, 12]} barSize={60}>
                                            <Cell fill="#34C759" opacity={0.6} />
                                            <Cell fill="#007AFF" opacity={0.8} />
                                            <Cell fill="#5856D6" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.section>
                </div>

                <motion.footer 
                    variants={itemVariants}
                    className="flex justify-center pt-8"
                >
                    <div className="px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl flex items-center gap-3 shadow-xl shadow-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#32D74B]" />
                        <span className="text-[#8E8E93] text-[10px] font-[800] uppercase tracking-[2px]">Lacos Admin • Integridade de Dados Verificada</span>
                        {data && <span className="text-[#AEAEB2] text-[10px] font-bold border-l border-[#E5E5EA] pl-3">Sync: {new Date(data.dataGeracao).toLocaleTimeString()}</span>}
                    </div>
                </motion.footer>
            </motion.div>
        </AdminLayout>
    );
}
