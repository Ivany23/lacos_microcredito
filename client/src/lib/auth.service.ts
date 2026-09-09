import { API_BASE_URL } from "./api.config";

// Re-export for backward compatibility (other files may import from here)
export { API_BASE_URL };


export interface LoginResponse {
    access_token: string;
    username: string;
    type: 'cliente' | 'funcionario';
    // Campos de Funcionário
    funcionarioId?: string;
    role?: string;
    nome?: string;
    // Campos de Cliente
    clienteId?: string;
    cliente?: {
        nome: string;
        email: string;
        telefone: string;
    };
}

export const authService = {
    async loginAdmin(email: string, senha: string): Promise<LoginResponse> {
        const url = `${API_BASE_URL}/auth/funcionario/login`;
        console.log(`[AuthService] Chamando login administrativo: ${url}`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: email, password: senha }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
            console.error(`[AuthService] Erro no login:`, errorData);
            throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : (errorData.message || "Falha no login administrativo"));
        }

        return response.json();
    },

    async loginClient(email: string, senha: string): Promise<LoginResponse> {
        const url = `${API_BASE_URL}/auth/cliente/login`;
        console.log(`[AuthService] Chamando login do cliente: ${url}`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: email, password: senha }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
            console.error(`[AuthService] Erro no login:`, errorData);
            throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : (errorData.message || "Falha no login do cliente"));
        }

        return response.json();
    },
};
