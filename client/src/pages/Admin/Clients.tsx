import { AdminLayout } from "@/components/AdminLayout";
import { Users, Search, Plus, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { clientService, Cliente, ClienteSexo, ClienteNacionalidade, TipoDocumento } from "@/lib/client.service";
import { useToast } from "@/hooks/use-toast";

type Step = 'bio' | 'location' | 'occupation' | 'document' | 'success';

export default function AdminClients() {
    const { toast } = useToast();
    const [, navigate] = useLocation();
    const [clients, setClients] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>('bio');

    const [bio, setBio] = useState({
        nome: "",
        sexo: ClienteSexo.MASCULINO,
        telefone: "",
        email: "",
        nacionalidade: ClienteNacionalidade.MOCAMBICANA,
        dataNascimento: ""
    });

    const [location, setLocation] = useState({
        provincia: "Maputo Cidade",
        distrito: "",
        cidade: "",
        bairro: "",
        quarteirao: "",
        numeroDaCasa: ""
    });

    const [occupation, setOccupation] = useState({
        codigo: "",
        nome: "",
        descricao: "",
        rendaMinima: 0
    });

    const [document, setDocument] = useState({
        tipoDocumento: TipoDocumento.BI,
        numeroDocumento: "",
        arquivo: null as File | null
    });

    const [isSaving, setIsSaving] = useState(false);

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const data = await clientService.getClientes();
            setClients(data);
        } catch (error: any) {
            console.error("Load Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadClients(); }, []);

    const handleFinalize = async () => {
        
        if (!bio.nome || !bio.telefone || !bio.dataNascimento) {
            toast({ title: "Dados Incompletos", description: "Preencha Nome, Telefone e Data de Nascimento.", variant: "destructive" });
            setCurrentStep('bio');
            return;
        }
        if (!location.provincia || !location.distrito || !location.cidade) {
            toast({ title: "Dados Incompletos", description: "Preencha Província, Distrito e Cidade.", variant: "destructive" });
            setCurrentStep('location');
            return;
        }
        if (!occupation.codigo || !occupation.nome) {
            toast({ title: "Dados Incompletos", description: "Preencha Código e Nome da Profissão.", variant: "destructive" });
            setCurrentStep('occupation');
            return;
        }
        if (!document.numeroDocumento) {
            toast({ title: "Dados Incompletos", description: "Preencha o Número do Documento.", variant: "destructive" });
            setCurrentStep('document');
            return;
        }

        setIsSaving(true);
        try {
            console.log("🔵 [INÍCIO] Iniciando gravação do cliente...");

            console.log("📝 [PASSO 1/3] Criando perfil do cliente...", bio);
            const resClient = await clientService.createCliente(bio);
            const clienteId = resClient.clienteId || resClient.id;

            if (!clienteId) {
                throw new Error("Erro: ID do cliente não foi retornado pela API");
            }

            console.log("✅ [PASSO 1/3] Cliente criado com sucesso! ID:", clienteId);

            console.log("📍 [PASSO 2/3] Criando localização e ocupação...");
            console.log("   → Localização:", { ...location, clienteId });
            console.log("   → Ocupação:", { ...occupation, clienteId });

            await Promise.all([
                clientService.createLocalizacao({ ...location, clienteId }),
                clientService.createOcupacao({
                    ...occupation,
                    clienteId,
                    rendaMinima: Number(occupation.rendaMinima) || 0,
                    ativo: true
                })
            ]);
            console.log("✅ [PASSO 2/3] Localização e ocupação criadas com sucesso!");

            console.log("📄 [PASSO 3/3] Criando documento...");
            const formData = new FormData();
            formData.append("clienteId", clienteId);
            formData.append("tipoDocumento", document.tipoDocumento);
            formData.append("numeroDocumento", document.numeroDocumento);
            if (document.arquivo) {
                formData.append("arquivo", document.arquivo);
                console.log("   → Arquivo anexado:", document.arquivo.name);
            }
            await clientService.createDocumento(formData);
            console.log("✅ [PASSO 3/3] Documento criado com sucesso!");

            console.log("🎉 [SUCESSO] Cliente registado completamente!");
            setCurrentStep('success');
            loadClients();
        } catch (error: any) {
            console.error("❌ [ERRO] Falha ao gravar cliente:", error);
            console.error("❌ [DETALHES] Mensagem:", error.message);
            console.error("❌ [DETALHES] Stack:", error.stack);

            let userMessage = "Ocorreu um erro ao gravar os dados.";

            if (error.message.includes("telefone")) {
                userMessage = "Este número de telefone já está registado.";
            } else if (error.message.includes("email")) {
                userMessage = "Este email já está registado.";
            } else if (error.message.includes("numeroDocumento")) {
                userMessage = "Este número de documento já está registado.";
            } else if (error.message.includes("400")) {
                userMessage = "Dados inválidos. Verifique os campos e tente novamente.";
            } else if (error.message.includes("401") || error.message.includes("403")) {
                userMessage = "Sessão expirada. Faça login novamente.";
            } else if (error.message.includes("network") || error.message.includes("fetch")) {
                userMessage = "Erro de conexão. Verifique sua internet.";
            }

            toast({
                title: "Erro ao Gravar",
                description: userMessage,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setCurrentStep('bio');
        setBio({ nome: "", sexo: ClienteSexo.MASCULINO, telefone: "", email: "", nacionalidade: ClienteNacionalidade.MOCAMBICANA, dataNascimento: "" });
        setLocation({ provincia: "Maputo Cidade", distrito: "", cidade: "", bairro: "", quarteirao: "", numeroDaCasa: "" });
        setOccupation({ codigo: "", nome: "", descricao: "", rendaMinima: 0 });
        setDocument({ tipoDocumento: TipoDocumento.BI, numeroDocumento: "", arquivo: null });
    };

    const nextStep = () => {
        const order: Step[] = ['bio', 'location', 'occupation', 'document', 'success'];
        const idx = order.indexOf(currentStep);
        if (idx < order.length - 1) setCurrentStep(order[idx + 1]);
    };

    const prevStep = () => {
        const order: Step[] = ['bio', 'location', 'occupation', 'document', 'success'];
        const idx = order.indexOf(currentStep);
        if (idx > 0) setCurrentStep(order[idx - 1]);
    };

    const filteredClients = clients.filter(c =>
        (c.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.telefone || "").includes(searchTerm)
    );

    return (
        <AdminLayout title="Clientes">
            <div className="space-y-6 max-w-[1000px] mx-auto">
                {}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[#8E8E93] text-[11px] font-black uppercase tracking-[2px] mb-1">Gestão de Clientes</p>
                        <h2 className="text-[34px] font-[900] text-[#1C1C1E] tracking-tight">Clientes</h2>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-11 h-11 bg-[#007AFF] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 stroke-[3px]" />
                    </button>
                </div>

                {}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                    <input
                        type="text"
                        placeholder="Pesquisar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-[#F2F2F7] border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all font-medium text-[15px] text-[#1C1C1E] placeholder:text-[#8E8E93]"
                    />
                </div>

                {}
                <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
                    {isLoading ? (
                        <div className="p-16 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" />
                            <p className="text-[#8E8E93] text-sm font-semibold">Carregando...</p>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="p-16 text-center">
                            <Users className="w-12 h-12 text-[#C7C7CC] mx-auto mb-3" />
                            <p className="text-[#8E8E93] font-semibold">Nenhum cliente encontrado</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#F2F2F7]">
                            {filteredClients.map((client) => (
                                <div
                                    key={client.clienteId || client.id || Math.random()}
                                    onClick={() => navigate(`/admin/clients/${client.clienteId || client.id}`)}
                                    className="p-4 flex items-center justify-between hover:bg-[#F9F9FB] transition-colors cursor-pointer active:bg-[#F2F2F7]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#007AFF] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {client.nome?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-[#1C1C1E] font-semibold text-[15px]">{client.nome}</p>
                                            <p className="text-[#8E8E93] text-[13px] font-medium">{client.telefone}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[#C7C7CC]" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-[480px] bg-[#F2F2F7] rounded-t-[28px] md:rounded-[28px] shadow-2xl overflow-hidden">
                        {}
                        <div className="px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-[#E5E5EA]">
                            <button onClick={resetForm} className="text-[#007AFF] font-semibold text-[15px]">Cancelar</button>
                            <h3 className="text-[15px] font-bold text-[#1C1C1E]">
                                {currentStep === 'bio' ? 'Dados Pessoais' :
                                    currentStep === 'location' ? 'Localização' :
                                        currentStep === 'occupation' ? 'Ocupação' :
                                            currentStep === 'document' ? 'Documento' : 'Concluído'}
                            </h3>
                            <div className="w-16"></div>
                        </div>

                        {}
                        <div className="px-6 py-3 flex justify-center gap-1.5">
                            {['bio', 'location', 'occupation', 'document'].map((s, i) => (
                                <div key={s} className={`h-1 rounded-full transition-all ${['bio', 'location', 'occupation', 'document'].indexOf(currentStep) >= i ? 'w-8 bg-[#007AFF]' : 'w-2 bg-[#D1D1D6]'
                                    }`}></div>
                            ))}
                        </div>

                        {}
                        <div className="px-6 pb-6 max-h-[55vh] overflow-y-auto">
                            {currentStep === 'bio' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-5 space-y-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Nome Completo *</label>
                                            <input value={bio.nome} onChange={e => setBio({ ...bio, nome: e.target.value })} className="w-full text-[17px] font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="Nome do cliente" />
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div>
                                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-2 block">Sexo *</label>
                                            <div className="flex gap-2">
                                                {Object.values(ClienteSexo).map(sex => (
                                                    <button key={sex} onClick={() => setBio({ ...bio, sexo: sex })} className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${bio.sexo === sex ? 'bg-[#007AFF] text-white' : 'bg-[#F2F2F7] text-[#8E8E93]'}`}>
                                                        {sex}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Telefone *</label>
                                                <input value={bio.telefone} onChange={e => setBio({ ...bio, telefone: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="+258" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Nascimento *</label>
                                                <input type="date" value={bio.dataNascimento} onChange={e => setBio({ ...bio, dataNascimento: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" />
                                            </div>
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div>
                                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Email (Opcional)</label>
                                            <input type="email" value={bio.email} onChange={e => setBio({ ...bio, email: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="email@exemplo.com" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 'location' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-5 space-y-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Província *</label>
                                            <select value={location.provincia} onChange={e => setLocation({ ...location, provincia: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent">
                                                {["Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Niassa", "Cabo Delgado"].map(p => (
                                                    <option key={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Distrito *</label>
                                                <input value={location.distrito} onChange={e => setLocation({ ...location, distrito: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="Ex: KaMpfumo" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Cidade *</label>
                                                <input value={location.cidade} onChange={e => setLocation({ ...location, cidade: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="Ex: Maputo" />
                                            </div>
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-3">
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Bairro</label>
                                                <input value={location.bairro} onChange={e => setLocation({ ...location, bairro: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="Nome do bairro" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Quarteirão</label>
                                                <input value={location.quarteirao} onChange={e => setLocation({ ...location, quarteirao: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent text-center" placeholder="Q" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Nº da Casa</label>
                                                <input value={location.numeroDaCasa} onChange={e => setLocation({ ...location, numeroDaCasa: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="Número" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 'occupation' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-5 space-y-4">
                                        <div className="grid grid-cols-4 gap-3">
                                            <div>
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Código *</label>
                                                <input value={occupation.codigo} onChange={e => setOccupation({ ...occupation, codigo: e.target.value })} className="w-full font-bold text-[#007AFF] outline-none bg-[#F2F2F7] rounded-lg px-2 py-1.5 text-center" placeholder="01" />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Profissão *</label>
                                                <input value={occupation.nome} onChange={e => setOccupation({ ...occupation, nome: e.target.value })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent" placeholder="Ex: Professor" />
                                            </div>
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div>
                                            <label className="text-[11px] font-bold text-[#34C759] uppercase tracking-wide mb-1.5 block">Renda Mensal (MZN)</label>
                                            <input type="number" value={occupation.rendaMinima} onChange={e => setOccupation({ ...occupation, rendaMinima: Number(e.target.value) })} className="w-full text-[28px] font-black text-[#34C759] outline-none bg-transparent" placeholder="0" />
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div>
                                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Descrição (Opcional)</label>
                                            <textarea value={occupation.descricao} onChange={e => setOccupation({ ...occupation, descricao: e.target.value })} className="w-full font-medium text-[#1C1C1E] outline-none bg-transparent resize-none" rows={2} placeholder="Detalhes sobre a ocupação..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 'document' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-5 space-y-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Tipo de Documento *</label>
                                            <select value={document.tipoDocumento} onChange={e => setDocument({ ...document, tipoDocumento: e.target.value as TipoDocumento })} className="w-full font-semibold text-[#1C1C1E] outline-none bg-transparent">
                                                {Object.values(TipoDocumento).map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <div>
                                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1.5 block">Número do Documento *</label>
                                            <input value={document.numeroDocumento} onChange={e => setDocument({ ...document, numeroDocumento: e.target.value })} className="w-full text-[17px] font-bold text-[#1C1C1E] outline-none bg-transparent" placeholder="Ex: 123456789X" />
                                        </div>
                                        <div className="h-px bg-[#F2F2F7]"></div>
                                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#C7C7CC] rounded-2xl cursor-pointer hover:bg-[#F9F9FB] transition-colors">
                                            {document.arquivo ? (
                                                <div className="text-center px-4">
                                                    <div className="w-10 h-10 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-[#34C759] truncate">{document.arquivo.name}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-10 h-10 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide">Carregar Arquivo</p>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" onChange={e => setDocument({ ...document, arquivo: e.target.files?.[0] || null })} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {currentStep === 'success' && (
                                <div className="py-8 text-center">
                                    <div className="w-16 h-16 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-[22px] font-bold text-[#1C1C1E] mb-2">Cliente Registado</h3>
                                    <p className="text-[#8E8E93] text-[13px] font-medium mb-6">Todos os dados foram guardados com sucesso.</p>
                                    <button onClick={resetForm} className="w-full h-12 bg-[#1C1C1E] text-white font-semibold rounded-xl active:scale-98 transition-transform">Concluir</button>
                                </div>
                            )}
                        </div>

                        {}
                        {currentStep !== 'success' && (
                            <div className="px-6 py-4 bg-white/80 backdrop-blur-xl border-t border-[#E5E5EA] flex justify-between items-center">
                                <button onClick={prevStep} disabled={currentStep === 'bio' || isSaving} className={`text-[15px] font-semibold ${currentStep === 'bio' ? 'invisible' : 'text-[#007AFF]'}`}>
                                    Voltar
                                </button>
                                <button
                                    onClick={currentStep === 'document' ? handleFinalize : nextStep}
                                    disabled={isSaving}
                                    className="h-11 px-8 bg-[#007AFF] text-white font-semibold rounded-xl flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : currentStep === 'document' ? 'Gravar Tudo' : 'Seguinte'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
