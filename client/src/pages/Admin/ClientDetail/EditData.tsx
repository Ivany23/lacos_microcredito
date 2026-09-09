import { useState, useEffect } from "react";
import { User, MapPin, Briefcase, FileText, Save, Loader2, CheckCircle2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientDetailService } from "@/lib/client-detail.service";

import { API_BASE_URL } from "@/lib/api.config";


type Section = "pessoal" | "localizacao" | "ocupacao" | "documento";

const SECTIONS: { key: Section; label: string; icon: any; color: string }[] = [
    { key: "pessoal", label: "Dados Pessoais", icon: User, color: "bg-[#007AFF]" },
    { key: "localizacao", label: "Localização", icon: MapPin, color: "bg-[#34C759]" },
    { key: "ocupacao", label: "Ocupação", icon: Briefcase, color: "bg-[#FF9500]" },
    { key: "documento", label: "Documento", icon: FileText, color: "bg-[#AF52DE]" },
];

export default function EditData({ data, refresh }: { data: any; refresh: () => void }) {
    const { toast } = useToast();
    const [activeSection, setActiveSection] = useState<Section>("pessoal");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [pessoal, setPessoal] = useState({
        nome: "",
        sexo: "",
        telefone: "",
        email: "",
        nacionalidade: "",
        dataNascimento: "",
    });

    const [localizacao, setLocalizacao] = useState({
        id: "",
        provincia: "",
        distrito: "",
        cidade: "",
        bairro: "",
        quarteirao: "",
        numeroDaCasa: "",
    });

    const [ocupacao, setOcupacao] = useState({
        id: "",
        nome: "",
        descricao: "",
        rendaMinima: "",
        codigo: "",
    });

    const [documento, setDocumento] = useState<{
        id: string;
        tipoDocumento: string;
        numeroDocumento: string;
        arquivo: File | null;
    }>({
        id: "",
        tipoDocumento: "",
        numeroDocumento: "",
        arquivo: null,
    });

    useEffect(() => {
        if (!data) return;
        setPessoal({
            nome: data.nome || "",
            sexo: data.sexo || "",
            telefone: data.telefone || "",
            email: data.email || "",
            nacionalidade: data.nacionalidade || "",
            dataNascimento: data.dataNascimento ? data.dataNascimento.split("T")[0] : "",
        });
        setLocalizacao({
            id: data.localizacao?.localizacaoId || "",
            provincia: data.localizacao?.provincia || "",
            distrito: data.localizacao?.distrito || "",
            cidade: data.localizacao?.cidade || "",
            bairro: data.localizacao?.bairro || "",
            quarteirao: data.localizacao?.quarteirao || "",
            numeroDaCasa: data.localizacao?.numeroDaCasa || "",
        });
        setOcupacao({
            id: data.ocupacoes?.[0]?.ocupacaoId || "",
            nome: data.ocupacoes?.[0]?.nome || "",
            descricao: data.ocupacoes?.[0]?.descricao || "",
            rendaMinima: data.ocupacoes?.[0]?.rendaMinima?.toString() || "",
            codigo: data.ocupacoes?.[0]?.codigo || "",
        });
        setDocumento({
            id: data.documentos?.[0]?.documentoId || "",
            tipoDocumento: data.documentos?.[0]?.tipoDocumento || "",
            numeroDocumento: data.documentos?.[0]?.numeroDocumento || "",
            arquivo: null,
        });
    }, [data]);

    const apiPatch = async (url: string, body: any) => {
        const token = localStorage.getItem("token");
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(err.message || "Erro ao salvar");
        }
        return await res.json();
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        try {
            const clienteId = data.clienteId || data.id;

            if (activeSection === "pessoal") {
                await apiPatch(`${API_BASE_URL}/clientes/${clienteId}`, {
                    nome: pessoal.nome,
                    sexo: pessoal.sexo,
                    telefone: pessoal.telefone,
                    email: pessoal.email,
                    nacionalidade: pessoal.nacionalidade,
                    dataNascimento: pessoal.dataNascimento,
                });
            }

            if (activeSection === "localizacao" && localizacao.id) {
                await apiPatch(`${API_BASE_URL}/localizacao/${localizacao.id}`, {
                    provincia: localizacao.provincia,
                    distrito: localizacao.distrito,
                    cidade: localizacao.cidade,
                    bairro: localizacao.bairro,
                    quarteirao: localizacao.quarteirao,
                    numeroDaCasa: localizacao.numeroDaCasa,
                });
            }

            if (activeSection === "ocupacao" && ocupacao.id) {
                await apiPatch(`${API_BASE_URL}/ocupacoes/${ocupacao.id}`, {
                    nome: ocupacao.nome,
                    descricao: ocupacao.descricao,
                    rendaMinima: Number(ocupacao.rendaMinima),
                    codigo: ocupacao.codigo,
                });
            }

            if (activeSection === "documento" && documento.id) {
                const formData = new FormData();
                formData.append("tipoDocumento", documento.tipoDocumento);
                formData.append("numeroDocumento", documento.numeroDocumento);
                if (documento.arquivo) {
                    formData.append("arquivo", documento.arquivo);
                }
                
                await clientDetailService.updateDocument(documento.id, formData);
            }

            setSaved(true);
            toast({ title: "Sucesso", description: "Dados atualizados com sucesso!" });
            refresh();
            setTimeout(() => setSaved(false), 2000);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const renderFields = () => {
        switch (activeSection) {
            case "pessoal":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Nome Completo" value={pessoal.nome} onChange={(v) => setPessoal({ ...pessoal, nome: v })} />
                        <FormField label="Telefone" value={pessoal.telefone} onChange={(v) => setPessoal({ ...pessoal, telefone: v })} />
                        <FormField label="Email" value={pessoal.email} onChange={(v) => setPessoal({ ...pessoal, email: v })} type="email" />
                        <FormField label="Nacionalidade" value={pessoal.nacionalidade} onChange={(v) => setPessoal({ ...pessoal, nacionalidade: v })} />
                        <FormField label="Data Nascimento" value={pessoal.dataNascimento} onChange={(v) => setPessoal({ ...pessoal, dataNascimento: v })} type="date" />
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide">Sexo</label>
                            <select
                                value={pessoal.sexo}
                                onChange={(e) => setPessoal({ ...pessoal, sexo: e.target.value })}
                                className="w-full px-4 py-3 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-[#1C1C1E] font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                            >
                                <option value="">Selecionar</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                        </div>
                    </div>
                );
            case "localizacao":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Província" value={localizacao.provincia} onChange={(v) => setLocalizacao({ ...localizacao, provincia: v })} />
                        <FormField label="Distrito" value={localizacao.distrito} onChange={(v) => setLocalizacao({ ...localizacao, distrito: v })} />
                        <FormField label="Cidade" value={localizacao.cidade} onChange={(v) => setLocalizacao({ ...localizacao, cidade: v })} />
                        <FormField label="Bairro" value={localizacao.bairro} onChange={(v) => setLocalizacao({ ...localizacao, bairro: v })} />
                        <FormField label="Quarteirão" value={localizacao.quarteirao} onChange={(v) => setLocalizacao({ ...localizacao, quarteirao: v })} />
                        <FormField label="Nº da Casa" value={localizacao.numeroDaCasa} onChange={(v) => setLocalizacao({ ...localizacao, numeroDaCasa: v })} />
                    </div>
                );
            case "ocupacao":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Profissão" value={ocupacao.nome} onChange={(v) => setOcupacao({ ...ocupacao, nome: v })} />
                        <FormField label="Código" value={ocupacao.codigo} onChange={(v) => setOcupacao({ ...ocupacao, codigo: v })} />
                        <FormField label="Renda Mensal (MZN)" value={ocupacao.rendaMinima} onChange={(v) => setOcupacao({ ...ocupacao, rendaMinima: v })} type="number" />
                        <div className="md:col-span-2">
                            <FormField label="Descrição" value={ocupacao.descricao} onChange={(v) => setOcupacao({ ...ocupacao, descricao: v })} />
                        </div>
                    </div>
                );
            case "documento":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide">Tipo de Documento</label>
                            <select
                                value={documento.tipoDocumento}
                                onChange={(e) => setDocumento({ ...documento, tipoDocumento: e.target.value })}
                                className="w-full px-4 py-3 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-[#1C1C1E] font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                            >
                                <option value="">Selecionar</option>
                                <option value="BI">BI</option>
                                <option value="Passaporte">Passaporte</option>
                                <option value="NUIT">NUIT</option>
                                <option value="Carta de Conducao">Carta de Condução</option>
                                <option value="DIRE">DIRE</option>
                                <option value="Certidao de Nascimento">Certidão de Nascimento</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <FormField label="Número do Documento" value={documento.numeroDocumento} onChange={(v) => setDocumento({ ...documento, numeroDocumento: v })} />
                        
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide mb-2 block">Atualizar Arquivo (Opcional)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#E5E5EA] rounded-2xl cursor-pointer hover:bg-[#F2F2F7] transition-all group">
                                {documento.arquivo ? (
                                    <div className="text-center px-4">
                                        <div className="w-10 h-10 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-2 text-white">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-bold text-[#34C759] truncate max-w-[200px]">{documento.arquivo.name}</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-10 h-10 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto mb-2 text-[#8E8E93] group-hover:text-[#007AFF] group-hover:bg-[#007AFF]/10 transition-colors">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest">Selecionar novo documento</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => setDocumento({ ...documento, arquivo: e.target.files?.[0] || null })} 
                                />
                            </label>
                        </div>
                    </div>
                );
        }
    };

    const currentSection = SECTIONS.find((s) => s.key === activeSection)!;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.key;
                    return (
                        <button
                            key={section.key}
                            onClick={() => { setActiveSection(section.key); setSaved(false); }}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group
                                ${isActive
                                    ? "border-[#007AFF] bg-[#007AFF]/5 shadow-lg shadow-blue-100 scale-[1.02]"
                                    : "border-[#E5E5EA] bg-white hover:border-[#007AFF]/30 hover:shadow-md"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all ${isActive ? section.color : "bg-[#E5E5EA]"}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-bold transition-colors ${isActive ? "text-[#007AFF]" : "text-[#8E8E93]"}`}>
                                {section.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#F2F2F7] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${currentSection.color}`}>
                            <currentSection.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1C1C1E] text-lg">{currentSection.label}</h3>
                            <p className="text-xs text-[#8E8E93] font-medium">Editar informações do cliente</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
                            ${saved
                                ? "bg-[#34C759] text-white"
                                : "bg-[#007AFF] text-white hover:bg-[#0056b3] active:scale-95"
                            }
                            ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saved ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
                    </button>
                </div>

                <div className="p-8">
                    {renderFields()}
                </div>
            </div>
        </div>
    );
}

function FormField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-[#1C1C1E] font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all placeholder:text-[#C7C7CC]"
                placeholder={`Inserir ${label.toLowerCase()}`}
            />
        </div>
    );
}
