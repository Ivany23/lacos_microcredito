const API_BASE_URL = "https://lacos-microcredito-api.vercel.app";

export enum ClienteSexo {
    MASCULINO = 'Masculino',
    FEMININO = 'Feminino',
    OUTRO = 'Outro'
}

export enum ClienteNacionalidade {
    MOCAMBICANA = 'Moçambicana',
    ESTRANGEIRA = 'Estrangeira'
}

export enum TipoDocumento {
    BI = 'BI',
    PASSAPORTE = 'Passaporte',
    CARTA_CONDUCAO = 'Carta de Conducao',
    NUIT = 'NUIT',
    CONTRATO_MICROCREDITO = 'Contrato Microcredito',
    LIVRETE = 'Livrete',
    DIRE = 'DIRE',
    CERTIDAO_NASCIMENTO = 'Certidao de Nascimento',
    CERTIFICADO_HABILITACOES = 'Certificado de Habilitacoes',
    COMPROVATIVO_RESIDENCIA = 'Comprovativo de Residencia',
    TALAO_DEPOSITO = 'Talao de Deposito',
    DUAT = 'DUAT',
    OUTRO = 'Outro'
}

export interface Cliente {
    id?: string;
    clienteId?: string;
    nome: string;
    sexo: ClienteSexo;
    telefone: string;
    email?: string;
    nacionalidade?: ClienteNacionalidade;
    dataNascimento: string;
}

export interface Localizacao {
    id: string;
    clienteId: string;
    provincia: string;
    distrito: string;
    cidade: string;
    bairro?: string;
    quarteirao?: string;
    numeroDaCasa?: string;
}

export interface Ocupacao {
    id: string;
    clienteId: string;
    codigo: string;
    nome: string;
    descricao?: string;
    rendaMinima?: number;
    ativo?: boolean;
}

export interface Documento {
    id: string;
    clienteId: string;
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
}

export interface Testemunha {
    id: string;
    clienteId: string;
    nome: string;
    telefone: string;
    grauParentesco: string;
    testemunhaDocumento: string;
}

export interface Penhor {
    id: string;
    clienteId: string;
    descricaoItem: string;
    valorEstimado: number;
    dataPenhora: string;
}

export const clientService = {
    async getClientes(): Promise<Cliente[]> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/clientes`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - GET Clientes]", {
                status: response.status,
                statusText: response.statusText,
                error: err
            });
            throw new Error(err.message || "Erro ao carregar clientes");
        }
        return response.json();
    },

    async createCliente(data: Omit<Cliente, "id">): Promise<Cliente> {
        const token = localStorage.getItem("token");
        const payload = { ...data };
        if (!payload.email) delete payload.email;

        
        if (payload.dataNascimento && !payload.dataNascimento.includes('T')) {
            
            payload.dataNascimento = payload.dataNascimento.split('T')[0];
        }

        console.log("📤 [REQUEST] Enviando para API:", {
            url: `${API_BASE_URL}/clientes`,
            method: "POST",
            payload: payload
        });

        const response = await fetch(`${API_BASE_URL}/clientes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        console.log("📥 [RESPONSE] Status:", response.status, response.statusText);

        if (!response.ok) {
            let err;
            try {
                err = await response.json();
                console.error("❌ [API ERROR - POST Cliente] Resposta completa da API:", {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    payload: payload,
                    errorResponse: err
                });
            } catch (parseError) {
                console.error("❌ [API ERROR - POST Cliente] Erro ao parsear resposta:", {
                    status: response.status,
                    statusText: response.statusText,
                    payload: payload,
                    parseError: parseError
                });
                err = { message: response.statusText };
            }

            
            let errorMessage = "Falha ao criar cliente";
            if (err.message) {
                errorMessage = err.message;
            } else if (err.error) {
                errorMessage = err.error;
            } else if (Array.isArray(err.message)) {
                errorMessage = err.message.join(", ");
            }

            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("✅ [SUCCESS] Cliente criado:", result);
        return result;
    },

    async createLocalizacao(data: Omit<Localizacao, "id">): Promise<Localizacao> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/localizacao`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - POST Localização]", {
                status: response.status,
                statusText: response.statusText,
                payload: data,
                error: err
            });
            throw new Error(err.message || "Falha ao salvar localização");
        }
        return response.json();
    },

    async createOcupacao(data: Omit<Ocupacao, "id">): Promise<Ocupacao> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/ocupacoes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - POST Ocupação]", {
                status: response.status,
                statusText: response.statusText,
                payload: data,
                error: err
            });
            throw new Error(err.message || "Falha ao salvar ocupação");
        }
        return response.json();
    },

    async createDocumento(data: FormData): Promise<Documento> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/documentos`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: data
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            console.error("❌ [API ERROR - POST Documento]", {
                status: response.status,
                statusText: response.statusText,
                error: err
            });
            throw new Error(err.message || "Falha ao salvar documento");
        }
        return response.json();
    },

    async createTestemunha(data: Omit<Testemunha, "id">): Promise<Testemunha> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/testemunhas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Falha ao salvar testemunha");
        }
        return response.json();
    },

    async createPenhor(data: Omit<Penhor, "id">): Promise<Penhor> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/penhor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Falha ao salvar penhor");
        }
        return response.json();
    }
};
