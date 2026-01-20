import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { clientDetailService } from "@/lib/client-detail.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LayoutDashboard, User, Wallet, FileText, Shield, ArrowLeft } from "lucide-react";


import Overview from "@/pages/Admin/ClientDetail/Overview";
import Profile from "@/pages/Admin/ClientDetail/Profile";
import Loans from "@/pages/Admin/ClientDetail/Loans";
import Documents from "@/pages/Admin/ClientDetail/Documents";
import Security from "@/pages/Admin/ClientDetail/Security";

export default function ClientDetailIndex() {
    const [, params] = useRoute("/admin/clients/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (params?.id) loadData(params.id);
    }, [params?.id]);

    const loadData = async (id: string) => {
        setIsLoading(true);
        try {

            const [client, payments, penalties, notifications, dashboard] = await Promise.all([
                clientDetailService.getClientDetails(id),
                clientDetailService.getClientPayments(id),
                clientDetailService.getClientPenalties(id),
                clientDetailService.getClientNotifications(id),
                clientDetailService.getClientDashboard(id)
            ]);

            // Integrando os dados para uso nos componentes filhos
            const fullData = {
                ...client,
                pagamentos: Array.isArray(payments) ? payments : [],
                penalizacoes: Array.isArray(penalties) ? penalties : [],
                notificacoes: Array.isArray(notifications) ? notifications : [],
                dashboard: dashboard || {}
            };

            console.log("📦 [DATA LOADED FULL]", fullData);
            setData(fullData);
        } catch (error: any) {
            console.error("❌ [ERRO]", error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
            setLocation("/admin/clients");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout title="Carregando...">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout title="Erro">
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1C1C1E] mb-2">Cliente não encontrado</h2>
                    <p className="text-[#8E8E93] mb-6">Não foi possível carregar os dados. Verifique a conexão ou se o cliente existe.</p>
                    <button
                        onClick={() => window.location.href = "/admin/clients"}
                        className="px-6 py-3 bg-[#007AFF] text-white rounded-xl font-bold hover:bg-[#0056b3] transition-colors"
                    >
                        Voltar para Lista
                    </button>
                </div>
            </AdminLayout>
        );
    }


    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview data={data} />;
            case 'profile': return <Profile data={data} refresh={() => loadData(params!.id)} />;
            case 'loans': return <Loans data={data} />;
            case 'documents': return <Documents data={data} />;
            case 'security': return <Security data={data} refresh={() => loadData(params!.id)} />;
            default: return <Overview data={data} />;
        }
    };

    return (
        <AdminLayout title="Gestão do Cliente">
            <div className="max-w-[1200px] mx-auto">
                { }
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <button onClick={() => setLocation("/admin/clients")} className="flex items-center gap-2 text-[#8E8E93] hover:text-[#007AFF] transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar à Lista
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                            {data.nome?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#1C1C1E]">{data.nome}</h1>
                            <p className="text-[#8E8E93] font-medium">Cliente #{data.clienteId?.substring(0, 8)}</p>
                        </div>
                    </div>
                </div>

                { }
                <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
                    <TabButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        icon={LayoutDashboard}
                        label="Visão Geral"
                    />
                    <TabButton
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                        icon={User}
                        label="Perfil & Dados"
                    />
                    <TabButton
                        active={activeTab === 'loans'}
                        onClick={() => setActiveTab('loans')}
                        icon={Wallet}
                        label="Empréstimos"
                    />
                    <TabButton
                        active={activeTab === 'documents'}
                        onClick={() => setActiveTab('documents')}
                        icon={FileText}
                        label="Documentos"
                    />
                    <TabButton
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                        icon={Shield}
                        label="Segurança"
                    />
                </div>

                { }
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderContent()}
                </div>
            </div>
        </AdminLayout>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all ${active
                ? "bg-[#1C1C1E] text-white shadow-lg transform scale-105"
                : "bg-white text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]"
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
