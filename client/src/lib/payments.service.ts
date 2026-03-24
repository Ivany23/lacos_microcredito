import { API_BASE_URL } from "./auth.service";

export interface Pagamento {
    pagamentoId: string;
    emprestimoId: string;
    clienteId: string;
    valorPago: number;
    dataPagamento: string;
    metodoPagamento: string;
    referenciaPagamento: string;
    cliente?: {
        nome: string;
    };
    emprestimo?: {
        valor: number;
    };
}

async function apiRequest(endpoint: string, method: string = 'GET', data?: any) {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro na operação" }));
        throw new Error(errorData.message || "Erro de rede");
    }

    return response.json();
}

export const paymentsService = {
    async getAll(): Promise<Pagamento[]> {
        return apiRequest('/pagamentos');
    },

    async registerDaily(data: { emprestimoId: string; valorPago: number; metodoPagamento: string; referenciaPagamento?: string }) {
        if (!data.valorPago || data.valorPago <= 0) {
            throw new Error("O valor deve ser maior que zero.");
        }
        return apiRequest('/pagamentos/diario', 'POST', data);
    },

    async getByLoan(loanId: string): Promise<Pagamento[]> {
        return apiRequest(`/pagamentos/emprestimo/${loanId}`);
    },

    async searchClients(): Promise<any[]> {
        return apiRequest('/clientes');
    },

    async getLoansByClient(clientId: string): Promise<any[]> {
        return apiRequest(`/emprestimos/cliente/${clientId}`);
    }
};
