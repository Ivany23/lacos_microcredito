import { useState } from "react";
import { Shield, Key, Lock, Unlock, Loader2, UserCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientDetailService } from "@/lib/client-detail.service";

export default function Security({ data, refresh }: { data: any, refresh: () => void }) {
    const { toast } = useToast();
    const [authForm, setAuthForm] = useState({ username: "", password: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleCreateAuth = async () => {
        if (!authForm.username || !authForm.password) {
            toast({ title: "Incompleto", description: "Preencha username e senha.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await clientDetailService.createClientAuth(data.clienteId || data.id, authForm);
            toast({ title: "Sucesso", description: "Acesso criado para o cliente!" });
            setAuthForm({ username: "", password: "" });
            refresh();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClientDelete = async () => {
        setIsSaving(true);
        try {
            await clientDetailService.deleteClient(data.clienteId || data.id);
            toast({ title: "Sucesso", description: "Cliente desativado/removido." });
            window.location.href = "/admin/clients";
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {}
            <div className={`p-6 rounded-3xl border ${data.autenticacao ? 'bg-white border-[#E5E5EA]' : 'bg-[#1C1C1E] text-white border-transparent'}`}>
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.autenticacao ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-white/10 text-white'}`}>
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black">Acesso ao Aplicativo</h2>
                        <p className={`text-sm ${data.autenticacao ? 'text-[#8E8E93]' : 'text-white/60'}`}>Credenciais de login do cliente</p>
                    </div>
                </div>

                {data.autenticacao ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#F2F2F7] rounded-xl border border-[#E5E5EA]">
                            <div>
                                <p className="text-xs font-bold text-[#8E8E93] uppercase">Username</p>
                                <p className="font-mono font-bold text-lg text-[#1C1C1E]">{data.autenticacao.username}</p>
                            </div>
                            <UserCheck className="w-6 h-6 text-[#34C759]" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="h-12 bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-xl font-bold text-[#1C1C1E] flex items-center justify-center gap-2 transition-colors">
                                <Key className="w-4 h-4" /> Resetar Senha
                            </button>
                            <button className={`h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${data.autenticacao.bloqueado ? 'bg-[#34C759] text-white hover:bg-[#248A3D]' : 'bg-[#FF3B30] text-white hover:bg-[#D70015]'}`}>
                                {data.autenticacao.bloqueado ? <><Unlock className="w-4 h-4" /> Desbloquear</> : <><Lock className="w-4 h-4" /> Bloquear</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wide mb-2 block">Username (Login)</label>
                                <input value={authForm.username} onChange={e => setAuthForm({ ...authForm, username: e.target.value })} className="w-full h-12 px-4 bg-white/10 backdrop-blur-md rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#34C759]" placeholder="Ex: joao.silva" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wide mb-2 block">Senha Temporária</label>
                                <input type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full h-12 px-4 bg-white/10 backdrop-blur-md rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#34C759]" placeholder="******" />
                            </div>
                        </div>
                        <button onClick={handleCreateAuth} disabled={isSaving} className="w-full h-14 bg-[#34C759] hover:bg-[#248A3D] text-white rounded-xl font-black text-lg shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Acesso'}
                        </button>
                    </div>
                )}
            </div>

            {}
            <div className="mt-8 border-t border-[#E5E5EA] pt-8">
                <h3 className="text-[#FF3B30] font-black text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                </h3>

                {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 border-2 border-[#FF3B30] text-[#FF3B30] rounded-xl font-bold hover:bg-[#FF3B30] hover:text-white transition-all w-full md:w-auto">
                        Remover Cliente e Dados
                    </button>
                ) : (
                    <div className="bg-[#FF3B30]/5 border border-[#FF3B30] p-4 rounded-xl">
                        <p className="font-bold text-[#1C1C1E] mb-2">Tem a certeza?</p>
                        <p className="text-sm text-[#8E8E93] mb-4">Esta ação não pode ser desfeita. Todos os dados (pagamentos, empréstimos, penalizações, penhores, testemunhas e documentos) serão apagados.</p>
                        <div className="flex gap-3">
                            <button onClick={handleClientDelete} disabled={isSaving} className="px-4 py-2 bg-[#FF3B30] text-white rounded-lg font-bold text-sm hover:bg-[#D70015]">Confirmar Exclusão</button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-white border border-[#E5E5EA] text-[#1C1C1E] rounded-lg font-bold text-sm hover:bg-[#F2F2F7]">Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
