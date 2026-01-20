import { AdminLayout } from "@/components/AdminLayout";
import { Settings, Shield, Bell, Database, ChevronRight } from "lucide-react";

export default function AdminSettings() {
    const settingsGroups = [
        {
            title: "Sistema",
            items: [
                { icon: Shield, label: "Segurança e Acessos", desc: "Gestão de senhas e níveis de permissão" },
                { icon: Bell, label: "Notificações", desc: "Configurações de alertas e mensagens SMS" }
            ]
        },
        {
            title: "Dados",
            items: [
                { icon: Database, label: "Backup e Sincronização", desc: "Exportação de base de dados e nuvem" }
            ]
        }
    ];

    return (
        <AdminLayout title="Configurações">
            <div className="space-y-10">
                <div className="space-y-1">
                    <h2 className="text-[34px] font-[900] text-[#1C1C1E] tracking-tight leading-tight">
                        Configurações
                    </h2>
                    <p className="text-[#8E8E93] font-semibold text-sm">
                        Parametrização global da plataforma
                    </p>
                </div>

                <div className="space-y-8">
                    {settingsGroups.map((group, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="text-[13px] font-black text-[#8E8E93] uppercase tracking-[2px] ml-4">
                                {group.title}
                            </h3>
                            <div className="bg-white rounded-[32px] border border-[#E5E5EA] overflow-hidden shadow-sm">
                                {group.items.map((item, i) => (
                                    <button
                                        key={i}
                                        className={`w-full flex items-center justify-between p-6 hover:bg-[#F2F2F7] transition-all group ${i !== group.items.length - 1 ? "border-b border-[#F2F2F7]" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 bg-[#F2F2F7] rounded-2xl flex items-center justify-center text-[#1C1C1E] group-hover:bg-[#007AFF] group-hover:text-white transition-all">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[#1C1C1E] font-black text-sm">{item.label}</p>
                                                <p className="text-[#8E8E93] text-xs font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-[#C7C7CC]" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
