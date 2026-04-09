import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useState, useEffect } from "react";
import { ClientLayout } from "@/components/ClientLayout";
import { clientDetailService } from "@/lib/client-detail.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// ─── Reutilizamos os mesmos painéis visuais do admin ───
import Overview   from "@/pages/Admin/ClientDetail/Overview";
import ClientProfilePanel from "@/pages/Admin/ClientDetail/Profile";
import Loans      from "@/pages/Admin/ClientDetail/Loans";

// ─── Painel de Notificações inline ───
import { Bell, CheckCircle2, X } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab]   = useState("overview");
  const [data, setData]             = useState<any>(null);
  const [isLoading, setIsLoading]   = useState(true);

  // Redireccionamentos de segurança
  if (!user) return <Redirect to="/login" />;


  // O clienteId vem do token JWT (guardado no user pelo auth hook)
  const clienteId = user.clienteId || user.clientId || (user as any).sub;

  useEffect(() => {
    if (!clienteId) {
      setIsLoading(false);
      return;
    }
    loadClientData(clienteId);
  }, [clienteId]);

  const loadClientData = async (id: string) => {
    setIsLoading(true);
    try {
      const [client, payments, penalties, notifications, dashboard] = await Promise.all([
        clientDetailService.getClientDetails(id),
        clientDetailService.getClientPayments(id),
        clientDetailService.getClientPenalties(id),
        clientDetailService.getClientNotifications(id),
        clientDetailService.getClientDashboard(id),
      ]);

      setData({
        ...client,
        pagamentos:    Array.isArray(payments)      ? payments      : [],
        penalizacoes:  Array.isArray(penalties)     ? penalties     : [],
        notificacoes:  Array.isArray(notifications) ? notifications : [],
        dashboard:     dashboard || {},
      });
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const notifCount = data?.notificacoes?.filter((n: any) => n.status !== "Lida").length || 0;
  const clientName = data?.nome || user.fullName;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-[#8E8E93] font-bold text-sm">A carregar os seus dados...</p>
          </div>
        </div>
      );
    }

    if (!clienteId || !data) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm space-y-4 p-8 bg-white rounded-3xl shadow-sm border border-[#E5E5EA]">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-black text-[#1C1C1E]">Dados não encontrados</h2>
            <p className="text-[#8E8E93] text-sm">
              A sua conta ainda não está associada a um perfil de cliente.
              Contacte a nossa equipa para assistência.
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <Overview data={data} />;

      case "profile":
        return <ClientProfilePanel data={data} refresh={() => loadClientData(clienteId)} />;

      case "loans":
        return <Loans data={data} refresh={() => loadClientData(clienteId)} />;

      case "notifs":
        return <NotificationsPanel data={data} refresh={() => loadClientData(clienteId)} />;

      default:
        return <Overview data={data} />;
    }
  };

  return (
    <ClientLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      notifCount={notifCount}
      clientName={clientName}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
    </ClientLayout>
  );
}

// ─────────────────────────────────────────────────────
// Painel de Notificações do Cliente
// ─────────────────────────────────────────────────────
function NotificationsPanel({ data, refresh }: { data: any; refresh: () => void }) {
  const { toast } = useToast();
  const notificacoes: any[] = Array.isArray(data.notificacoes) ? data.notificacoes : [];
  const [selected, setSelected] = useState<any>(null);

  const markAsRead = async (id: string) => {
    try {
      await clientDetailService.markNotificationAsRead(id);
      toast({ title: "Marcada como lida" });
      refresh();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-[#E5E5EA] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Bell className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1C1C1E] tracking-tight">Notificações</h2>
            <p className="text-[#8E8E93] text-sm">Avisos e comunicações da Laços Microcrédito</p>
          </div>
        </div>
        {notificacoes.filter(n => n.status !== "Lida").length > 0 && (
          <span className="bg-primary text-white text-xs font-black px-3 py-1.5 rounded-full">
            {notificacoes.filter(n => n.status !== "Lida").length} Não lidas
          </span>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1C1C1E]">{selected.tipo || "Notificação"}</h3>
                  <p className="text-sm text-[#8E8E93]">{new Date(selected.dataEnvio).toLocaleString("pt-PT")}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-[#F2F2F7] rounded-full">
                <X className="w-5 h-5 text-[#8E8E93]" />
              </button>
            </div>
            <div className="bg-[#F2F2F7] rounded-2xl p-5 mb-6">
              <p className="text-[#1C1C1E] font-medium leading-relaxed">{selected.mensagem}</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-full py-3 bg-[#1C1C1E] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {notificacoes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E5E5EA] shadow-sm text-center">
          <CheckCircle2 className="w-12 h-12 text-[#34C759] mx-auto mb-4" />
          <h3 className="font-bold text-[#1C1C1E] text-lg mb-1">Tudo em ordem!</h3>
          <p className="text-[#8E8E93] text-sm">Não tem notificações pendentes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((notif: any, idx: number) => (
            <div
              key={idx}
              onClick={() => { setSelected(notif); markAsRead(notif.notificacaoId || notif.id); }}
              className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md hover:scale-[1.005] flex gap-4 items-start
                ${notif.status === "Lida" ? "border-[#E5E5EA] opacity-70" : "border-orange-200 bg-orange-50/30"}`}
            >
              <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${notif.status === "Lida" ? "bg-[#D1D1D6]" : "bg-orange-500 animate-pulse"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className={`text-sm font-bold truncate ${notif.status === "Lida" ? "text-[#8E8E93]" : "text-[#1C1C1E]"}`}>
                    {notif.tipo || "Aviso do Sistema"}
                  </p>
                  <span className="text-[10px] font-bold text-[#AEAEB2] flex-shrink-0">
                    {new Date(notif.dataEnvio).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                <p className="text-sm text-[#8E8E93] line-clamp-2 leading-relaxed">{notif.mensagem}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
