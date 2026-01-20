import { useState, useEffect } from "react";
import { User, MapPin, Briefcase, Phone, Mail, FileText, CreditCard, Building2, Calendar, Map, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientDetailService } from "@/lib/client-detail.service";

const API_BASE_URL = "https://lacos-microcredito-api.vercel.app";

const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return dateString.split('T')[0];
};

const calculateAge = (dateString: string) => {
    if (!dateString) return "";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return `${age} anos`;
};

const getInitials = (name: string) => {
    if (!name) return "CL";
    const names = name.split(" ");
    if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

export default function Profile({ data, refresh }: { data: any, refresh: () => void }) {
    const { toast } = useToast();
    const [form, setForm] = useState<any>({});

    useEffect(() => {
        if (data) {
            setForm({
                // Cliente Entity
                clienteId: data.clienteId || data.id,
                nome: data.nome || "",
                sexo: data.sexo || "",
                telefone: data.telefone || "",
                email: data.email || "",
                nacionalidade: data.nacionalidade || "Moçambicana",
                dataNascimento: formatDateForInput(data.dataNascimento),
                dataCadastro: data.dataCadastro,

                // Localizacao Entity
                localizacaoId: data.localizacao?.localizacaoId,
                provincia: data.localizacao?.provincia || "",
                distrito: data.localizacao?.distrito || "",
                cidade: data.localizacao?.cidade || "",
                bairro: data.localizacao?.bairro || "",
                quarteirao: data.localizacao?.quarteirao || "",
                numeroDaCasa: data.localizacao?.numeroDaCasa || "",

                // Ocupacao Entity (First item)
                ocupacaoId: data.ocupacoes?.[0]?.ocupacaoId,
                ocupacaoNome: data.ocupacoes?.[0]?.nome || "", // 'nome' in DB
                ocupacaoDescricao: data.ocupacoes?.[0]?.descricao || "",
                ocupacaoRenda: data.ocupacoes?.[0]?.rendaMinima || 0,
                ocupacaoCodigo: data.ocupacoes?.[0]?.codigo || "",

                // Documento Entity (First item)
                documentoId: data.documentos?.[0]?.documentoId,
                tipoDocumento: data.documentos?.[0]?.tipoDocumento || "",
                numeroDocumento: data.documentos?.[0]?.numeroDocumento || ""
            });
        }
    }, [data]);

    return (
        <div className="flex flex-col md:flex-row min-h-[850px] bg-white shadow-2xl rounded-[2.5rem] overflow-hidden font-sans border border-[#E5E5EA] animate-in fade-in duration-500 relative">

            {/* COLUNA ESQUERDA (Sidebar Azul) */}
            <aside className="w-full md:w-[38%] bg-gradient-to-br from-[#007AFF] to-[#005EC4] text-white p-10 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                <div className="relative z-10 space-y-10">
                    {/* Cabeçalho do Perfil */}
                    <div className="space-y-4">
                        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-4xl font-black shadow-xl mb-6">
                            {getInitials(form.nome)}
                        </div>

                        <div>
                            <h1 className="text-4xl font-black tracking-tight leading-tight">{form.nome || "Nome do Cliente"}</h1>
                            <p className="text-blue-100 font-medium mt-2 text-sm uppercase tracking-wider opacity-80">
                                {form.nacionalidade} • {calculateAge(form.dataNascimento)}
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-white/20 w-full mb-6"></div>

                    {/* Informações de Contato */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Contacto Directo</h3>
                        <div className="space-y-5">
                            <ContactItem icon={Phone} label="Telefone" value={form.telefone} />
                            <ContactItem icon={Mail} label="Email" value={form.email} />
                            <ContactItem icon={MapPin} label="Localização" value={`${form.cidade || ""}, ${form.provincia || ""}`} />
                        </div>
                    </div>

                    <div className="h-px bg-white/20 w-full mb-6"></div>

                    {/* Documentação */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Documentação</h3>
                        <div className="space-y-4">
                            <DocumentItem label="Tipo Doc." value={form.tipoDocumento} />
                            <DocumentItem label="Número" value={form.numeroDocumento} highlight />
                        </div>
                    </div>
                </div>
            </aside>

            {/* COLUNA DIREITA (Conteúdo Branco) */}
            <main className="flex-1 bg-white p-10 md:p-14 overflow-y-auto space-y-12">

                {/* Seção Profissional */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-1 bg-[#007AFF] rounded-full"></div>
                        <h2 className="text-2xl font-black text-[#1C1C1E] tracking-tight uppercase">Dados Profissionais</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <DetailField label="Profissão (Nome)" value={form.ocupacaoNome} large />
                        <DetailField label="Renda Mensal (MZN)" value={form.ocupacaoRenda} highlight />
                        <DetailField label="Descrição / Detalhes" value={form.ocupacaoDescricao} fullWidth />
                    </div>
                </section>

                <div className="h-px bg-[#E5E5EA] w-full"></div>

                {/* Seção Residência */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-1 bg-[#34C759] rounded-full"></div>
                        <h2 className="text-2xl font-black text-[#1C1C1E] tracking-tight uppercase">Endereço & Residência</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <DetailField label="Província" value={form.provincia} />
                        <DetailField label="Distrito" value={form.distrito} />
                        <DetailField label="Cidade" value={form.cidade} />
                        <DetailField label="Bairro" value={form.bairro} />
                        <div className="flex gap-4">
                            <DetailField label="Quarteirão" value={form.quarteirao} />
                            <DetailField label="Casa Nº" value={form.numeroDaCasa} />
                        </div>
                    </div>
                </section>

                {/* Seção Outros Detalhes (Nacionalidade, etc) */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-1 bg-[#FF9500] rounded-full"></div>
                        <h2 className="text-2xl font-black text-[#1C1C1E] tracking-tight uppercase">Outros Detalhes</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DetailField label="Nacionalidade" value={form.nacionalidade} />
                        <DetailField label="Data Nascimento" value={form.dataNascimento} />
                        <DetailField label="Sexo" value={form.sexo} />
                    </div>
                </section>

            </main>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Componentes Auxiliares
// -----------------------------------------------------------------------------

function ContactItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-4 text-white/90">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="text-[10px] uppercase font-bold opacity-60 mb-0.5">{label}</p>
                <p className="font-semibold text-sm truncate">{value || "—"}</p>
            </div>
        </div>
    );
}

function DocumentItem({ label, value, highlight, simple }: any) {
    return (
        <div className={`relative ${!simple ? 'bg-white/5 rounded-xl p-3 border border-white/10' : ''}`}>
            {!simple && <p className="text-[10px] uppercase font-bold opacity-50 mb-1">{label}</p>}
            {simple ? (
                <div>
                    <p className="text-[10px] uppercase font-bold opacity-50 mb-1">{label}</p>
                    <p className="font-bold text-sm tracking-wide">{value || "—"}</p>
                </div>
            ) : (
                <p className={`font-mono ${highlight ? 'text-lg font-black text-white tracking-widest' : 'text-sm font-bold tracking-wide'}`}>{value || "—"}</p>
            )}
        </div>
    );
}

function DetailField({ label, value, fullWidth, large, highlight }: any) {
    return (
        <div className={`flex flex-col gap-2 ${fullWidth ? 'md:col-span-2' : ''}`}>
            <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide">{label}</label>
            <div className={`border-b border-[#E5E5EA] pb-2 ${large ? 'pt-1' : ''}`}>
                <p className={`
                    ${large ? 'text-xl font-black text-[#1C1C1E]' : 'text-base font-semibold text-[#1C1C1E]'}
                    ${highlight ? 'text-[#007AFF]' : ''}
                    break-words
                `}>
                    {value || <span className="text-gray-300 italic text-sm font-normal">Não informado</span>}
                </p>
            </div>
        </div>
    );
}
