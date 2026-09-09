import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Shield, Bell, Database, ChevronRight, Search, Key, Users, ChevronLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientService, Cliente } from "@/lib/client.service";

import { API_BASE_URL } from "@/lib/api.config";


type AuthState = {
    autenticacaoId: string;
    clienteId: string;
    username: string;
    bloqueado: boolean;
    tentativasLogin: number;
    ultimoLogin: string;
} | null;

export default function AdminSettings() {
    const { toast } = useToast();
    const [view, setView] = useState<'main' | 'client-auth'>('main');
    
    // Client Auth states
    const [clients, setClients] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [loadingClients, setLoadingClients] = useState(false);
    
    const [authState, setAuthState] = useState<AuthState>(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isBlocked, setIsBlocked] = useState(false);

    const loadClients = async () => {
        setLoadingClients(true);
        try {
            const data = await clientService.getClientes();
            setClients(data);
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao carregar clientes", variant: "destructive" });
        } finally {
            setLoadingClients(false);
        }
    };

    const loadClientAuth = async (clienteId: string) => {
        setLoadingAuth(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/cliente/${clienteId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setAuthState(data);
                setUsername(data.username);
                setIsBlocked(data.bloqueado);
                setPassword(""); // Never load password
            } else if (res.status === 404) {
                setAuthState(null);
                setUsername("");
                setPassword("");
                setIsBlocked(false);
            } else {
                throw new Error("Falha ao buscar autenticação");
            }
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar os dados de acesso", variant: "destructive" });
        } finally {
            setLoadingAuth(false);
        }
    };

    const handleSelectClient = (client: Cliente) => {
        setSelectedClient(client);
        loadClientAuth(client.clienteId || client.id!);
    };

    const handleSaveAuth = async () => {
        if (!selectedClient) return;
        const clienteId = selectedClient.clienteId || selectedClient.id!;
        const token = localStorage.getItem("token");
        setIsSaving(true);
        
        try {
            if (authState) {
                // Update existing
                const payload: any = { bloqueado: isBlocked };
                if (username !== authState.username) payload.username = username;
                if (password) payload.password = password;
                
                const res = await fetch(`${API_BASE_URL}/auth/cliente/${clienteId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || "Erro ao atualizar");
                }
                
                toast({ title: "Sucesso", description: "Credenciais atualizadas com sucesso", style: { backgroundColor: '#34C759', color: 'white' } });
            } else {
                // Create new
                if (!username || !password) {
                    throw new Error("Username e senha são obrigatórios");
                }
                
                const res = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ clienteId, username, password })
                });
                
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || "Erro ao criar");
                }
                
                toast({ title: "Sucesso", description: "Acesso criado com sucesso", style: { backgroundColor: '#34C759', color: 'white' } });
            }
            
            await loadClientAuth(clienteId);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const settingsGroups = [
        {
            title: "Sistema e Segurança",
            items: [
                { 
                    icon: Key, 
                    label: "Gestão de Acessos", 
                    desc: "Criar ou atualizar credenciais de clientes",
                    onClick: () => { setView('client-auth'); loadClients(); }
                },
                { icon: Bell, label: "Notificações", desc: "Configurações de alertas e mensagens SMS" }
            ]
        },
        {
            title: "Dados e Manutenção",
            items: [
                { icon: Database, label: "Backup e Sincronização", desc: "Exportação de base de dados e nuvem" }
            ]
        }
    ];

    const filteredClients = clients.filter(c => 
        (c.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.telefone || "").includes(searchTerm)
    );

    return (
        <AdminLayout title="Configurações">
            {view === 'main' && (
                <div className="space-y-10 max-w-[900px] mx-auto animate-in slide-in-from-left-4 fade-in duration-300">
                    <div className="space-y-1">
                        <h2 className="text-[34px] font-[900] text-[#1C1C1E] tracking-tight leading-tight">
                            Configurações
                        </h2>
                        <p className="text-[#8E8E93] font-semibold text-[15px]">
                            Parametrização global e gestão de segurança
                        </p>
                    </div>

                    <div className="space-y-8">
                        {settingsGroups.map((group, idx) => (
                            <div key={idx} className="space-y-3">
                                <h3 className="text-[12px] font-black text-[#8E8E93] uppercase tracking-[2px] ml-4">
                                    {group.title}
                                </h3>
                                <div className="bg-white rounded-3xl border border-[#E5E5EA] overflow-hidden shadow-sm">
                                    {group.items.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={item.onClick}
                                            className={`w-full flex items-center justify-between p-5 hover:bg-[#F9F9FB] transition-all group ${
                                                i !== group.items.length - 1 ? "border-b border-[#F2F2F7]" : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 bg-[#F2F2F7] rounded-2xl flex items-center justify-center text-[#1C1C1E] group-hover:bg-[#007AFF] group-hover:text-white group-hover:scale-105 transition-all duration-300">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[#1C1C1E] font-bold text-[15px]">{item.label}</p>
                                                    <p className="text-[#8E8E93] text-[13px] font-medium">{item.desc}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-[#C7C7CC] group-hover:text-[#007AFF] group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'client-auth' && (
                <div className="space-y-6 max-w-[1000px] mx-auto animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <button 
                            onClick={() => { setView('main'); setSelectedClient(null); }}
                            className="w-10 h-10 bg-white border border-[#E5E5EA] rounded-full flex items-center justify-center hover:bg-[#F2F2F7] transition-colors shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5 text-[#1C1C1E]" />
                        </button>
                        <div>
                            <h2 className="text-[28px] font-[900] text-[#1C1C1E] tracking-tight">Gestão de Acessos</h2>
                            <p className="text-[#8E8E93] font-semibold text-sm">Credenciais e segurança dos clientes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Lista de Clientes */}
                        <div className="md:col-span-1 bg-white rounded-[28px] border border-[#E5E5EA] flex flex-col h-[600px] overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-[#F2F2F7]">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-10 pr-4 bg-[#F2F2F7] rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all placeholder:text-[#8E8E93]"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto">
                                {loadingClients ? (
                                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-[#007AFF] animate-spin" /></div>
                                ) : filteredClients.length === 0 ? (
                                    <div className="p-10 text-center text-[#8E8E93] text-sm font-semibold">Nenhum cliente</div>
                                ) : (
                                    <div className="divide-y divide-[#F2F2F7]">
                                        {filteredClients.map((c) => {
                                            const id = c.clienteId || c.id!;
                                            const isSelected = selectedClient?.clienteId === id || selectedClient?.id === id;
                                            
                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => handleSelectClient(c)}
                                                    className={`w-full p-4 flex items-center gap-3 text-left transition-all ${
                                                        isSelected ? "bg-[#007AFF]/5" : "hover:bg-[#F9F9FB]"
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                                        isSelected ? "bg-[#007AFF] text-white shadow-md relative scale-105" : "bg-[#F2F2F7] text-[#1C1C1E]"
                                                    } transition-all duration-300`}>
                                                        {c.nome.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className={`text-[14px] font-bold truncate ${isSelected ? "text-[#007AFF]" : "text-[#1C1C1E]"}`}>
                                                            {c.nome}
                                                        </p>
                                                        <p className="text-[12px] text-[#8E8E93] font-medium">{c.telefone}</p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Formulário de Autenticação */}
                        <div className="md:col-span-2">
                            {selectedClient ? (
                                <div className="bg-white rounded-[28px] border border-[#E5E5EA] p-8 shadow-sm h-full max-h-[600px] overflow-hidden">
                                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#F2F2F7]">
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#007AFF] to-[#0056B3] rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <Shield className="w-6 h-6 shadow-sm" />
                                        </div>
                                        <div>
                                            <h3 className="text-[20px] font-black text-[#1C1C1E]">{selectedClient.nome}</h3>
                                            <p className="text-[14px] font-semibold text-[#8E8E93]">
                                                {loadingAuth ? "Verificando status..." : (authState ? "Acesso Configurado" : "Sem Acesso")}
                                            </p>
                                        </div>
                                    </div>

                                    {loadingAuth ? (
                                        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" /></div>
                                    ) : (
                                        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                            {authState && (
                                                <div className="flex items-center justify-between p-4 bg-[#F2F2F7] rounded-2xl border border-[#E5E5EA]">
                                                    <div>
                                                        <p className="text-[12px] font-black text-[#8E8E93] uppercase tracking-wide">Status da Conta</p>
                                                        <p className={`text-[14px] font-bold ${authState.bloqueado ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
                                                            {authState.bloqueado ? "BLOQUEADA" : "ATIVA"}
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setIsBlocked(!isBlocked)}
                                                        className={`relative w-14 h-8 rounded-full flex items-center p-1 transition-colors duration-300 shadow-inner ${
                                                            isBlocked ? "bg-[#FF3B30]" : "bg-[#34C759]"
                                                        }`}
                                                    >
                                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                                            isBlocked ? "translate-x-6" : ""
                                                        }`} />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-[12px] font-bold text-[#1C1C1E] mb-2 block">Username</label>
                                                    <input 
                                                        type="text" 
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="w-full h-12 px-4 bg-[#F9F9FB] border border-[#E5E5EA] rounded-xl font-medium text-[15px] focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 outline-none transition-all shadow-sm"
                                                        placeholder="Ex: joao.silva"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[12px] font-bold text-[#1C1C1E] mb-2 block">
                                                        {authState ? "Nova Senha (deixe em branco para manter)" : "Senha de Acesso"}
                                                    </label>
                                                    <input 
                                                        type="password" 
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full h-12 px-4 bg-[#F9F9FB] border border-[#E5E5EA] rounded-xl font-medium text-[15px] focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 outline-none transition-all shadow-sm"
                                                        placeholder="Mínimo 6 caracteres"
                                                    />
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handleSaveAuth}
                                                disabled={isSaving}
                                                className="w-full h-12 mt-8 bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg"
                                            >
                                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                {authState ? "Atualizar Credenciais" : "Criar Acesso"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[28px] border border-[#E5E5EA] h-[600px] flex flex-col items-center justify-center text-center p-8 shadow-sm animate-in fade-in">
                                    <div className="w-20 h-20 bg-[#F2F2F7] rounded-full flex items-center justify-center mb-6">
                                        <Users className="w-10 h-10 text-[#C7C7CC]" />
                                    </div>
                                    <h3 className="text-[20px] font-bold text-[#1C1C1E] mb-2">Nenhum Cliente Selecionado</h3>
                                    <p className="text-[#8E8E93] font-medium max-w-[250px] leading-relaxed">
                                        Selecione um cliente na lista ao lado para gerir o seu acesso à plataforma.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
