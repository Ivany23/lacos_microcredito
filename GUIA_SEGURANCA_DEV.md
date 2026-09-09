# 🔐 Guia de Segurança — Laços Software (Frontend)

## Visão Geral

O frontend da Laços Software tem 4 camadas de segurança para proteger as URLs da API e dados sensíveis:

| Camada | Protecção | Ficheiro |
|--------|-----------|----------|
| 🔒 Proxy Reverso | URL real do backend escondida no Network tab | `vercel.json` |
| 🔒 Config Centralizada | URL da API num único ficheiro (não hardcoded) | `api.config.ts` |
| 🔒 Console Limpo | `console.log` removido em produção | `vite.config.ts` |
| 🔒 Anti-DevTools | F12, Ctrl+Shift+I, clique-direito bloqueados | `devtools-guard.ts` |

---

## 🛠️ Como os Desenvolvedores Acedem a Erros em Produção

### O que é preservado automaticamente

Mesmo em produção, os seguintes logs **NUNCA** são removidos:
- `console.error()` → Erros de API, falhas de rede, crashes
- `console.warn()` → Avisos importantes

Apenas `console.log()` e `console.info()` são removidos (são os que expõem URLs e dados sensíveis).

---

## 🔑 Dev Mode Secreto — Activação

O Dev Mode desbloqueia o DevTools e mostra logs completos **em produção**. Existem 2 formas de activar:

### Método 1 — Via URL (Mais Rápido)

1. Abra o browser (Chrome, Edge, Firefox, etc.)
2. Na barra de endereço, adicione `?dev_debug=lacos2024` ao fim da URL do site:

```
https://lacos-microcredito.vercel.app/?dev_debug=lacos2024
```

3. Pressione **Enter**
4. ✅ Pronto! O Dev Mode está activo. O sistema guarda automaticamente no `localStorage`.

> **Nota**: Funciona em qualquer página. Exemplos:
> - `https://lacos-microcredito.vercel.app/admin/dashboard?dev_debug=lacos2024`
> - `https://lacos-microcredito.vercel.app/login?dev_debug=lacos2024`

---

### Método 2 — Via Console do Chrome (Manual)

Este método é útil quando não quer alterar a URL.

1. Abra o site normalmente no Chrome
2. Abra o Chrome DevTools usando **uma destas formas**:
   - Menu do Chrome: **⋮ → Mais ferramentas → Ferramentas do programador**
   - Ou abra o DevTools **antes** de navegar ao site (abra um separador em branco, pressione F12, e depois cole a URL do site)
3. No separador **Console**, escreva:

```javascript
localStorage.setItem('LACOS_DEV_MODE', 'true')
```

4. Pressione **Enter**
5. Recarregue a página com **F5** ou **Ctrl+R**
6. ✅ Pronto! O Dev Mode está activo.

---

### O que muda com o Dev Mode activo

| Funcionalidade | Sem Dev Mode | Com Dev Mode |
|----------------|-------------|-------------|
| F12 (DevTools) | ❌ Bloqueado | ✅ Funciona |
| Ctrl+Shift+I | ❌ Bloqueado | ✅ Funciona |
| Clique-direito → Inspecionar | ❌ Bloqueado | ✅ Funciona |
| Console logs detalhados | ❌ Ocultos | ✅ Visíveis |
| `console.error` | ✅ Sempre visível | ✅ Sempre visível |

---

## ❌ Como Desactivar o Dev Mode

### Método 1 — Via Console
```javascript
localStorage.removeItem('LACOS_DEV_MODE')
```
Depois recarregue a página (F5).

### Método 2 — Limpar dados do site
1. Chrome → DevTools → **Application** → **Storage** → **Clear site data**

---

## 📋 Como Verificar se o Dev Mode Está Activo

No Console do Chrome, escreva:
```javascript
localStorage.getItem('LACOS_DEV_MODE')
```

- Retorna `"true"` → Dev Mode **activo**
- Retorna `null` → Dev Mode **inactivo**

---

## 🌐 Como Funciona o Proxy Reverso

### Antes (inseguro)
```
Browser → https://lacos-microcredito-api.vercel.app/clientes
         ↑ URL do backend visível no Network tab!
```

### Depois (seguro)
```
Browser → /api/clientes (mesmo domínio)
Vercel → https://lacos-microcredito-api.vercel.app/clientes (internamente)
         ↑ URL do backend NUNCA visível no browser!
```

No Chrome DevTools → Network tab, o utilizador vê apenas:
```
GET /api/clientes  200  OK
GET /api/dashboard  200  OK
```

Em vez de:
```
GET https://lacos-microcredito-api.vercel.app/clientes  ← EXPOSTO!
```

---

## 📁 Ficheiros de Segurança

| Ficheiro | Descrição |
|----------|-----------|
| [`api.config.ts`](client/src/lib/api.config.ts) | Config central da API — dev usa localhost, prod usa /api |
| [`logger.ts`](client/src/lib/logger.ts) | Logger inteligente com sanitização de JWT/senhas |
| [`devtools-guard.ts`](client/src/lib/devtools-guard.ts) | Bloqueio do DevTools em produção |
| [`ErrorBoundary.tsx`](client/src/components/ErrorBoundary.tsx) | Captura erros de terceiros (web-vitals) |
| [`vercel.json`](vercel.json) | Proxy reverso Vercel |
| [`vite.config.ts`](vite.config.ts) | Remove console.log no build de produção |

---

## ⚠️ Regras para Developers

1. **NUNCA** adicione a URL `https://lacos-microcredito-api.vercel.app` directamente no código. Use sempre:
   ```typescript
   import { API_BASE_URL } from "@/lib/api.config";
   ```

2. **Use o logger** em vez de `console.log` para informações de debug:
   ```typescript
   import { logger } from "@/lib/logger";
   logger.debug("Dados do cliente:", data);  // Removido em produção
   logger.error("Falha na API:", error);     // Sempre visível
   ```

3. **Tokens JWT** e **senhas** são automaticamente sanitizados pelo logger.

4. A chave do Dev Mode (`lacos2024`) é **confidencial**. Não partilhe com utilizadores finais.

---

## 🔍 Auditoria de Segurança (Resultados do Build)

```
✅ console.log no build de produção:  0 ocorrências (REMOVIDO)
✅ console.error no build de produção: 33 ocorrências (PRESERVADO)
✅ console.warn no build de produção:  7 ocorrências (PRESERVADO)
✅ URL do backend exposta no build:    0 ocorrências (ESCONDIDA)
```
