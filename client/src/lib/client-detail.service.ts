import { API_BASE_URL } from "./api.config";


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

        const apiDelete = async (url: string): Promise<boolean> => {
            try {
                const res = await fetch(url, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const ok = res.ok;
                console.log(ok ? `  ✅ Removido: ${url}` : `  ⚠️ Falha (${res.status}): ${url}`);
                return ok;
            } catch (e) {
                console.warn(`  ⚠️ Erro de rede: ${url}`, e);
                return false;
            }
        };

        const apiGet = async (url: string): Promise<any[]> => {
            try {
                const res = await fetch(url, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) return [];
                const data = await res.json();
                const arr = Array.isArray(data) ? data : [];
                return arr;
            } catch {
                return [];
            }
        };

        
        const getId = (obj: any, ...keys: string[]) => {
            for (const k of keys) {
                if (obj[k]) return obj[k];
            }
            return obj.id;
        };

        const clientData = await this.getClientDetails(id);

        
        const emprestimos = await apiGet(`${API_BASE_URL}/emprestimos/cliente/${id}`);

        for (const emp of emprestimos) {
            const empId = getId(emp, 'emprestimoId');

            
            const penalizacoes = await apiGet(`${API_BASE_URL}/penalizacoes/emprestimo/${empId}`);
            for (const p of penalizacoes) {
                await apiDelete(`${API_BASE_URL}/penalizacoes/${getId(p, 'penalizacaoId')}`);
            }

            
            const pagEmp = await apiGet(`${API_BASE_URL}/pagamentos/emprestimo/${empId}`);
            for (const pg of pagEmp) {
                await apiDelete(`${API_BASE_URL}/pagamentos/${getId(pg, 'pagamentoId')}`);
            }

            
            const penhoresEmp = await apiGet(`${API_BASE_URL}/penhor/emprestimo/${empId}`);
            for (const ph of penhoresEmp) {
                await apiDelete(`${API_BASE_URL}/penhor/${getId(ph, 'penhorId')}`);
            }

            
            const testemunhasEmp = await apiGet(`${API_BASE_URL}/testemunhas/emprestimo/${empId}`);
            for (const t of testemunhasEmp) {
                await apiDelete(`${API_BASE_URL}/testemunhas/${getId(t, 'testemunhaId')}`);
            }

            
            await apiDelete(`${API_BASE_URL}/emprestimos/${empId}`);
        }

        
        const pagCliente = await apiGet(`${API_BASE_URL}/pagamentos/cliente/${id}`);
        for (const pg of pagCliente) {
            await apiDelete(`${API_BASE_URL}/pagamentos/${getId(pg, 'pagamentoId')}`);
        }

        
        const penCliente = await apiGet(`${API_BASE_URL}/penalizacoes/cliente/${id}`);
        for (const p of penCliente) {
            await apiDelete(`${API_BASE_URL}/penalizacoes/${getId(p, 'penalizacaoId')}`);
        }

        
        const notificacoes = await apiGet(`${API_BASE_URL}/notificacoes/cliente/${id}`);
        for (const n of notificacoes) {
            await apiDelete(`${API_BASE_URL}/notificacoes/${getId(n, 'notificacaoId')}`);
        }

        
        const testemunhas = await apiGet(`${API_BASE_URL}/testemunhas/cliente/${id}`);
        for (const t of testemunhas) {
            await apiDelete(`${API_BASE_URL}/testemunhas/${getId(t, 'testemunhaId')}`);
        }

        
        const penhores = await apiGet(`${API_BASE_URL}/penhor/cliente/${id}`);
        for (const ph of penhores) {
            await apiDelete(`${API_BASE_URL}/penhor/${getId(ph, 'penhorId')}`);
        }

        
        const docsApi = await apiGet(`${API_BASE_URL}/documentos/cliente/${id}`);
        const allDocs = [...(clientData.documentos || []), ...docsApi];
        const docIds = new Set<string>();
        for (const doc of allDocs) {
            const docId = getId(doc, 'documentoId');
            if (docId && !docIds.has(docId)) {
                docIds.add(docId);
                await apiDelete(`${API_BASE_URL}/documentos/${docId}`);
            }
        }

        
        const ocsApi = await apiGet(`${API_BASE_URL}/ocupacoes/cliente/${id}`);
        const allOcs = [...(clientData.ocupacoes || []), ...ocsApi];
        const ocIds = new Set<string>();
        for (const oc of allOcs) {
            const ocId = getId(oc, 'ocupacaoId');
            if (ocId && !ocIds.has(ocId)) {
                ocIds.add(ocId);
                await apiDelete(`${API_BASE_URL}/ocupacoes/${ocId}`);
            }
        }

        
        const locsApi = await apiGet(`${API_BASE_URL}/localizacao/cliente/${id}`);
        const allLocs = clientData.localizacao ? [clientData.localizacao, ...locsApi] : locsApi;
        const locIds = new Set<string>();
        for (const loc of allLocs) {
            const locId = getId(loc, 'localizacaoId');
            if (locId && !locIds.has(locId)) {
                locIds.add(locId);
                await apiDelete(`${API_BASE_URL}/localizacao/${locId}`);
            }
        }

        
        try {
            const allAuthRes = await fetch(`${API_BASE_URL}/auth/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (allAuthRes.ok) {
                const allAuth = await allAuthRes.json();
                const authList = Array.isArray(allAuth) ? allAuth : [];
                const clientAuth = authList.find(
                    (a: any) => String(a.clienteId) === String(id) || String(a.cliente?.clienteId) === String(id)
                );
                if (clientAuth) {
                    const authId = clientAuth.autenticacaoId || clientAuth.id;
                    console.log(`  🔐 Autenticação encontrada: ${authId} — removendo...`);
                    await apiDelete(`${API_BASE_URL}/auth/users/${authId}`);
                } else {
                    console.log("  📭 Nenhuma autenticação encontrada para este cliente");
                }
            }
        } catch (e) {
            console.warn("  ⚠️ Erro ao buscar autenticações (ignorado):", e);
        }

        
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            console.log("✅ [SUCCESS] Cliente removido com sucesso!");
            return;
        }

        const err = await response.json().catch(() => ({ message: response.statusText }));
        console.error("❌ [DELETE Client falhou]", err);
        throw new Error(err.message || "Erro ao remover cliente");
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
    },

    async getDocumentFile(id: string): Promise<Blob> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/documentos/${id}/arquivo`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(err.message || "Erro ao buscar arquivo");
        }

        return await response.blob();
    },

    async updateDocument(id: string, data: FormData): Promise<any> {
        const token = localStorage.getItem("token");
        console.log("📄 [PATCH] Atualizando documento:", id);

        const response = await fetch(`${API_BASE_URL}/documentos/${id}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` },
            body: data
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - PATCH Documento]", {
                status: response.status,
                error: err
            });
            throw new Error(err.message || "Erro ao atualizar documento");
        }

        return await response.json();
    },

    async deleteLoan(loanId: string): Promise<void> {
        const token = localStorage.getItem("token");
        console.log("🗑️ [DELETE] Removendo empréstimo (backend fará o cascade):", loanId);

        const response = await fetch(`${API_BASE_URL}/emprestimos/${loanId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(err.message || "Erro ao remover empréstimo");
        }

        console.log("✅ [SUCCESS] Empréstimo e dados relacionados removidos com sucesso!");
    }
};
