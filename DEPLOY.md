# FitLife — Guia de Deploy na Vercel

## Visão geral

O projeto tem duas partes que são deployadas separadamente na Vercel:

| Parte | Pasta | Tipo |
|---|---|---|
| Frontend | `academia-poo/` | Vite + React (SPA estático) |
| Backend | `fitlife-api/` | Node.js Serverless Functions |

> **Banco de dados:** O PostgreSQL precisa estar em um serviço externo acessível pela internet.
> Recomendados: **Neon** (gratuito, serverless PostgreSQL), **Supabase** ou **Railway**.

---

## 1. Banco de dados (fazer primeiro)

### Opção recomendada: Neon (gratuito)

1. Acesse https://neon.tech e crie uma conta
2. Crie um projeto e um banco chamado `fitlife`
3. Copie a **Connection String** no formato:
   ```
   postgresql://usuario:senha@host/fitlife?sslmode=require
   ```
4. No painel do Neon, abra o **SQL Editor** e execute:
   ```sql
   -- Cole o conteúdo completo de academia-poo/database/schema.sql
   ```
5. **NÃO execute o seed.sql em produção** — ele cria usuários de desenvolvimento.
6. Crie o Super Admin de produção:
   ```sql
   INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel)
   VALUES (
     1,
     'Seu Nome',
     'seu@email.com',
     crypt('SUA_SENHA_FORTE', gen_salt('bf')),
     'superadmin'
   );
   ```
7. Depois do primeiro deploy do backend, rode a migração de hashes:
   ```bash
   cd fitlife-api
   node migrate-senha.js
   ```

---

## 2. Deploy do Backend na Vercel

### Via GitHub (recomendado)

1. Suba a pasta `fitlife-api/` em um repositório GitHub (pode ser um repo separado)
2. Acesse https://vercel.com → **Add New Project**
3. Importe o repositório do backend
4. Configure:
   - **Root Directory:** `fitlife-api` (se estiver no monorepo) ou raiz do repo
   - **Framework Preset:** Other
   - **Build Command:** *(deixar vazio)*
   - **Output Directory:** *(deixar vazio)*
   - **Install Command:** `npm install`

5. Adicione as **Environment Variables** no painel da Vercel:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` | Host do Neon/Supabase |
| `DB_PORT` | `5432` |
| `DB_NAME` | `fitlife` |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Chave aleatória longa (gere abaixo) |
| `CORS_ORIGIN` | URL do frontend (ex: `https://fitlife-app.vercel.app`) |

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

6. Clique em **Deploy**
7. Anote a URL gerada (ex: `https://fitlife-api.vercel.app`)
8. Teste: `https://fitlife-api.vercel.app/health` deve retornar `{"status":"ok"}`

> **Dica com Neon:** Use a Connection String diretamente via `DATABASE_URL` se preferir,
> ou preencha DB_HOST, DB_PORT, DB_USER, DB_PASSWORD e DB_NAME separadamente.

---

## 3. Deploy do Frontend na Vercel

1. Suba a pasta `academia-poo/` em um repositório GitHub
2. Acesse https://vercel.com → **Add New Project**
3. Importe o repositório do frontend
4. Configure:
   - **Root Directory:** `academia-poo` (se monorepo) ou raiz
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Adicione a **Environment Variable**:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `https://fitlife-api.vercel.app/api` |

6. Clique em **Deploy**
7. Anote a URL gerada (ex: `https://fitlife-app.vercel.app`)

---

## 4. Conectar frontend ↔ backend

Após os dois deploys:

1. **No projeto do backend** no painel da Vercel:
   - Vá em Settings → Environment Variables
   - Atualize `CORS_ORIGIN` com a URL real do frontend:
     `https://fitlife-app.vercel.app`
   - Clique em **Redeploy**

2. **No projeto do frontend** no painel da Vercel:
   - Confirme que `VITE_API_URL` aponta para a URL real do backend:
     `https://fitlife-api.vercel.app/api`
   - Se precisou alterar, clique em **Redeploy**

---

## 5. Atualizar domínio nos arquivos do projeto

Após definir as URLs, substitua `DOMINIO.com` em:

- `academia-poo/index.html` — canonical, og:url, JSON-LD
- `academia-poo/public/robots.txt` — linha do Sitemap
- `academia-poo/public/llms.txt` — URL de contato
- `academia-poo/public/sitemap.xml` — quando houver landing page

---

## 6. Estrutura de arquivos Vercel

```
fitlife-api/
├── api/
│   └── index.js        ← entrada da Vercel Serverless Function
├── src/
│   ├── app.js          ← Express sem listen() (usado pela Vercel)
│   └── index.js        ← Express com listen() (usado localmente)
└── vercel.json         ← roteamento: tudo → api/index.js

academia-poo/
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── llms.txt
├── src/
├── vercel.json         ← SPA fallback: todas as rotas → index.html
└── vite.config.ts
```

---

## 7. Checklist pós-deploy

- [ ] `https://fitlife-api.vercel.app/health` retorna `{"status":"ok"}`
- [ ] `https://fitlife-app.vercel.app` carrega a tela de login
- [ ] Login funciona com as credenciais de produção
- [ ] Sem erro de CORS no console do navegador
- [ ] Botões de "acesso rápido para teste" **não aparecem** na tela de login
- [ ] `https://fitlife-app.vercel.app/robots.txt` acessível
- [ ] `https://fitlife-app.vercel.app/sitemap.xml` acessível
- [ ] `https://fitlife-app.vercel.app/llms.txt` acessível
- [ ] Arquivo `.env` **não está** no repositório Git

---

## 8. Desenvolvimento local

```bash
# Backend
cd fitlife-api
cp .env.example .env       # preencha com seus dados locais
npm install
npm run dev                # roda em http://localhost:3000

# Frontend
cd academia-poo
cp .env.example .env       # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev                # roda em http://localhost:5173
```

---

## 9. Pendências

- Domínio personalizado (configurar em Settings → Domains na Vercel)
- Política de privacidade e termos de uso (LGPD)
- Plano de backup do banco (o Neon tem backup automático no plano gratuito)
- Monitoramento de erros (ex: Sentry)
