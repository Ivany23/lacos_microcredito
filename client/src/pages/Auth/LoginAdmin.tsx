import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, ArrowRight, UserCog } from "lucide-react";

export default function LoginAdmin() {
    const { loginAdmin, isLoggingIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginAdmin({ email, password });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                { }
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 transform transition-all hover:shadow-3xl">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl mb-4 shadow-lg">
                                <UserCog className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-2">
                                Portal Administrativo
                            </h1>
                            <p className="text-gray-600">
                                Acesso restrito a funcionários
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" />
                                    Nome de Usuário
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="admin.user"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 pl-4 pr-4 bg-white/50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" />
                                    Senha
                                </label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 pl-4 pr-4 bg-white/50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Validando Acesso...
                                    </>
                                ) : (
                                    <>
                                        Acessar Painel
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
