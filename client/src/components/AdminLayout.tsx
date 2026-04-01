import { Link, useLocation } from "wouter";
import {
    LayoutDashboard,
    Users,
    Wallet,
    Receipt,
    Settings,
    LogOut,
    ChevronRight,
    Bell,
    AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    const [location] = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
        { icon: Users, label: "Clientes", href: "/admin/clients" },
        { icon: Wallet, label: "Empréstimos", href: "/admin/loans" },
        { icon: Receipt, label: "Pagamentos", href: "/admin/payments" },
        { icon: AlertTriangle, label: "Penalizações", href: "/admin/penalties" },
        { icon: Settings, label: "Configurações", href: "/admin/settings" },
    ];

    return (
        <div className="flex min-h-screen bg-[#F2F2F7]">
            {}
            <aside className="w-[280px] bg-white border-r border-[#E5E5EA] flex flex-col sticky top-0 h-screen hidden md:flex">
                <div className="p-8">
                    <div className="flex items-center gap-3 px-2 mb-8">
                        <div className="w-10 h-10 bg-[#007AFF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <span className="text-white font-black text-xl">L</span>
                        </div>
                        <div>
                            <p className="text-[#1C1C1E] font-black leading-none">Lacos Admin</p>
                            <p className="text-[#8E8E93] text-[10px] font-bold uppercase tracking-wider mt-1">Gestão Pro</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const isActive = location === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${isActive
                                        ? "bg-[#007AFF] text-white shadow-md shadow-blue-100"
                                        : "text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#AEAEB2] group-hover:text-[#007AFF]"}`} />
                                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-[#F2F2F7]">
                    <div className="flex items-center gap-3 mb-6 p-2">
                        <div className="w-10 h-10 bg-[#E5E5EA] rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#8E8E93]" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[#1C1C1E] font-bold text-sm truncate">{user?.fullName || "Administrador"}</p>
                            <p className="text-[#8E8E93] text-[11px] font-medium truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[#FF3B30] font-bold text-sm rounded-2xl hover:bg-[#FFF2F2] transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </div>
            </aside>

            {}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1200px] mx-auto p-6 md:p-12">
                    {}
                    <div className="flex items-center justify-between mb-8">
                        <div className="md:hidden w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E5E5EA] flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-[#007AFF]" />
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E5E5EA] flex items-center justify-center relative">
                                <Bell className="w-5 h-5 text-[#1C1C1E]" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF3B30] rounded-full ring-2 ring-white"></span>
                            </button>
                        </div>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
