import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { authService, LoginResponse } from "@/lib/auth.service";

export interface User {
  email: string;
  fullName?: string;
  role?: 'admin' | 'client';
  token?: string;
  [key: string]: any;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  loginClient: (data: LoginData) => Promise<void>;
  loginAdmin: (data: LoginData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (response: LoginResponse, role: 'admin' | 'client') => {
    const userData: User = {
      email: response.username || 'user@example.com',
      role: role,
      token: response.access_token,
      fullName: response.nome || (response.cliente ? response.cliente.nome : (response.username || 'Usuário')),
    };

    if (response.cliente?.email) {
      userData.email = response.cliente.email;
    }

    if (role === 'admin' && response.username && response.username.includes('@')) {
      userData.email = response.username;
    }

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", response.access_token);

    toast({
      title: "Login realizado com sucesso!",
      description: `Bem-vindo, ${userData.fullName}`,
    });

    if (role === 'admin') {
      setTimeout(() => setLocation("/admin/dashboard"), 100);
    } else {
      setTimeout(() => setLocation("/profile"), 100);
    }
  };

  const loginClient = async (data: LoginData) => {
    setIsLoggingIn(true);
    try {
      const response = await authService.loginClient(data.email, data.password);
      handleLoginSuccess(response, 'client');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Não foi possível entrar.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginAdmin = async (data: LoginData) => {
    setIsLoggingIn(true);
    try {
      const response = await authService.loginAdmin(data.email, data.password);
      handleLoginSuccess(response, 'admin');
    } catch (error: any) {
      toast({
        title: "Erro no login administrativo",
        description: error.message || "Não foi possível entrar como administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = (data: RegisterData) => {
    setIsRegistering(true);
    setTimeout(() => {
      if (data.password !== data.confirmPassword) {
        toast({
          title: "Erro no registro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
      }

      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      if (storedUsers.some((u: any) => u.email === data.email)) {
        toast({
          title: "Erro no registro",
          description: "Email já registrado",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
      }

      const newUser = {
        email: data.email,
        password: data.password,
        fullName: data.email.split("@")[0],
      };

      storedUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(storedUsers));
      toast({
        title: "Conta criada!",
        description: "Faça login para continuar.",
      });
      setLocation("/login");
      setIsRegistering(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLocation("/");
    toast({
      title: "Sessão encerrada",
      description: "Até logo!",
    });
  };

  const value = {
    user,
    isLoading,
    isLoggingIn,
    isRegistering,
    loginClient,
    loginAdmin,
    login: loginClient,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
