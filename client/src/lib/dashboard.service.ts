import { API_BASE_URL } from "./auth.service";

export interface DashboardData {
    sucesso: boolean;
    dataGeracao: string;
    empresa: string;
    kpisPrincipais: {
        totalClientes: {
            valor: number;
            clientesAtivos: number;
            descricao: string;
        };
        capitalEmprestado: {
            valor: string;
            valorNumerico: number;
            descricao: string;
        };
        capitalRecebido: {
            valor: string;
            valorNumerico: number;
            descricao: string;
        };
        lucroRealizado: {
            valor: string;
            valorNumerico: number;
            descricao: string;
        };
        taxaInadimplencia: {
            valor: string;
            valorNumerico: number;
            nivel: 'BAIXO' | 'MODERADO' | 'CRITICO';
            descricao: string;
        };
        penalizacoesPendentes: {
            quantidade: number;
            valor: string;
            valorNumerico: number;
            descricao: string;
        };
    };
    desempenhoMensal: {
        variacoes: {
            emprestimos: { valor: number; tendencia: 'alta' | 'baixa' | 'estavel' };
            pagamentos: { valor: number; tendencia: 'alta' | 'baixa' | 'estavel' };
        };
    };
    alertas: {
        emprestimosAVencer: {
            quantidade: number;
            valor: string;
            prioridade: string;
        };
        emprestimosVencidos: {
            quantidade: number;
            valor: string;
            prioridade: string;
        };
    };
}

export const dashboardService = {
    async getDashboardPrincipal(): Promise<DashboardData> {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/dashboard`;
        console.log(`[API] Chamando Dashboard: ${url}`);

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(`[API Error] Falha ao carregar dashboard: ${response.status}`);
            throw new Error("Falha ao carregar dados do dashboard");
        }

        return response.json();
    },

    async getAnalisePagamentos(): Promise<any> {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/dashboard/pagamentos`;
        console.log(`[API] Chamando Pagamentos: ${url}`);

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(`[API Error] Falha ao carregar pagamentos: ${response.status}`);
            throw new Error("Falha ao carregar análise de pagamentos");
        }

        return response.json();
    },

    async getAnaliseEmprestimos(): Promise<any> {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/dashboard/emprestimos`;

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Falha ao carregar análise de empréstimos");
        }

        return response.json();
    },

    async getProjecoesFinanceiras(): Promise<any> {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/dashboard/projecoes`;

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Falha ao carregar projeções financeiras");
        }

        return response.json();
    }
};
