const API_BASE_URL = "https://lacos-microcredito-api.vercel.app";

export const clientDetailService = {

    async getClientDetails(id: string): Promise<any> {
        const token = localStorage.getItem("token");
        console.log("📥 [GET] Buscando cliente:", id);

        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - GET Client Details]", {
                status: response.status,
                url: `${API_BASE_URL}/clientes/${id}`,
                error: err
            });
            throw new Error(err.message || "Erro ao carregar detalhes do cliente");
        }

        const data = await response.json();
        console.log("✅ [SUCCESS] Cliente carregado:", data);
        return data;
    },

    async getClientDashboard(id: string): Promise<any> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/clientes/${id}/dashboard`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) return null;
        return await response.json();
    },


    async updateClient(id: string, data: any): Promise<any> {
        const token = localStorage.getItem("token");
        console.log("📝 [PATCH] Atualizando cliente:", id, data);

        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - PATCH Client]", {
                status: response.status,
                url: `${API_BASE_URL}/clientes/${id}`,
                payload: data,
                error: err
            });
            throw new Error(err.message || "Erro ao atualizar cliente");
        }

        const result = await response.json();
        console.log("✅ [SUCCESS] Cliente atualizado:", result);
        return result;
    },


    async deleteClient(id: string): Promise<void> {
        const token = localStorage.getItem("token");
        console.log("🗑️ [DELETE] Removendo cliente:", id);

        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - DELETE Client]", {
                status: response.status,
                url: `${API_BASE_URL}/clientes/${id}`,
                error: err
            });
            throw new Error(err.message || "Erro ao remover cliente");
        }

        console.log("✅ [SUCCESS] Cliente removido (cascata: localização, ocupação, documentos)");
    },


    async getClientPayments(id: string): Promise<any[]> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/pagamentos/cliente/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    },


    async getClientPenalties(id: string): Promise<any[]> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/penalizacoes/cliente/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    },

    async getClientNotifications(id: string): Promise<any[]> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/notificacoes/cliente/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    },

    async markNotificationAsRead(id: string): Promise<void> {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/notificacoes/${id}/ler`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },


    async createClientAuth(clienteId: string, data: { username: string; password: string }): Promise<any> {
        const token = localStorage.getItem("token");
        const payload = { clienteId, ...data };

        console.log("🔐 [POST] Criando autenticação:", payload);

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - POST Auth]", {
                status: response.status,
                url: `${API_BASE_URL}/auth/register`,
                payload: payload,
                error: err
            });


            let errorMsg = "Erro ao criar autenticação";
            if (err.message?.includes("username")) {
                errorMsg = "Este username já está em uso";
            } else if (err.message?.includes("clienteId")) {
                errorMsg = "Cliente já possui autenticação";
            } else if (err.message) {
                errorMsg = err.message;
            }

            throw new Error(errorMsg);
        }

        const result = await response.json();
        console.log("✅ [SUCCESS] Autenticação criada:", result);
        return result;
    }
};
