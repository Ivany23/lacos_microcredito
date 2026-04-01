import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, ArrowRight, Sparkles, Phone } from "lucide-react";

export default function Login() {
    const { user, login, isLoggingIn } = useAuth();
    const [, setLocation] = useLocation();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                setLocation("/admin/dashboard");
            } else {
                setLocation("/profile");
            }
        }
    }, [user, setLocation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // A API espera um campo 'username', que pode ser o email ou telefone do cliente
        login({ email: identifier, password });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                {}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 transform transition-all hover:shadow-3xl">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-3xl mb-6 shadow-xl shadow-primary/20 transform -rotate-3 hover:rotate-0 transition-transform">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3 tracking-tight">
                                Área do Cliente
                            </h1>
                            <p className="text-gray-500 font-medium">
                                Aceda à sua conta e gira os seus créditos
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-primary" /> Usuário ou Telefone
                                </label>
                                <div className="relative group">
                                    <Input
                                        type="text"
                                        placeholder="Seu email ou contacto"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        className="h-14 pl-5 bg-gray-50/50 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all text-lg font-medium"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center text-gray-300 group-focus-within:text-primary transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-2">
                                    <Lock className="w-4 h-4 text-primary" /> Senha de Acesso
                                </label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-14 pl-5 bg-gray-50/50 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all text-lg"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
                                >
                                    {isLoggingIn ? (
                                        <>
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Validando...
                                        </>
                                    ) : (
                                        <>
                                            Entrar Agora
                                            <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                                Gestão de MicroCrédito • MZ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

