import { useLocation } from "wouter";
import {
    LayoutDashboard,
    User,
    Wallet,
    Bell,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface ClientLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    notifCount?: number;
    clientName?: string;
}

const menuItems = [
    { id: "overview",  icon: LayoutDashboard, label: "Visão Geral" },
    { id: "profile",   icon: User,            label: "Meu Perfil" },
    { id: "loans",     icon: Wallet,          label: "Meus Créditos" },
    { id: "notifs",    icon: Bell,            label: "Notificações" },
];

export function ClientLayout({ children, activeTab, onTabChange, notifCount = 0, clientName }: ClientLayoutProps) {
    const { logout, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const getInitials = (name: string) => {
        if (!name) return "CL";
        const parts = name.split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const displayName = clientName || user?.fullName || user?.email?.split("@")[0] || "Cliente";

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="p-8">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <span className="text-white font-black text-xl">L</span>
                    </div>
                    <div>
                        <p className="text-[#1C1C1E] font-black leading-none">Área do Cliente</p>
                        <p className="text-[#8E8E93] text-[10px] font-bold uppercase tracking-wider mt-1">Laços Microcrédito</p>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group
                                    ${isActive
                                        ? "bg-primary text-white shadow-md shadow-blue-100"
                                        : "text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#AEAEB2] group-hover:text-primary"}`} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </div>
                                {item.id === "notifs" && notifCount > 0 && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-white text-primary" : "bg-primary text-white"}`}>
                                        {notifCount}
                                    </span>
                                )}
                                {isActive && item.id !== "notifs" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer: user info + logout */}
            <div className="mt-auto p-8 border-t border-[#F2F2F7]">
                <div className="flex items-center gap-3 mb-6 p-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-black text-sm">{getInitials(displayName)}</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[#1C1C1E] font-bold text-sm truncate">{displayName}</p>
                        <p className="text-[#8E8E93] text-[11px] font-medium truncate">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[#FF3B30] font-bold text-sm rounded-2xl hover:bg-[#FFF2F2] transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sair com Segurança
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F2F2F7] font-sans">
            {/* Sidebar — Desktop */}
            <aside className="w-[280px] bg-white border-r border-[#E5E5EA] sticky top-0 h-screen hidden md:flex flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-[280px] bg-white h-full shadow-2xl flex flex-col z-10">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-[#F2F2F7] text-[#8E8E93]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1200px] mx-auto p-4 md:p-10">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between mb-6 md:hidden">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E5E5EA] flex items-center justify-center"
                        >
                            <Menu className="w-5 h-5 text-primary" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-sm">L</span>
                            </div>
                            <span className="font-black text-[#1C1C1E] text-sm">Área do Cliente</span>
                        </div>
                        <div className="relative">
                            <Bell className="w-6 h-6 text-[#8E8E93]" />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full">
                                    {notifCount}
                                </span>
                            )}
                        </div>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
