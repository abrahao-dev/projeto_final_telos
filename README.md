# TaskInsight — Projeto Final Telos

> Aplicação web full-stack de gestão de tarefas com autenticação, dashboard analítico e notebook Python embarcado. Desenvolvido para a Sprint 1 do projeto **Inova.Ação PCD**.

---

## Sumário

1. [Sobre o projeto](#sobre-o-projeto)
2. [Stack tecnológica](#stack-tecnológica)
3. [Funcionalidades](#funcionalidades)
4. [Estrutura de pastas](#estrutura-de-pastas)
5. [Pré-requisitos](#pré-requisitos)
6. [Instalação e setup](#instalação-e-setup)
7. [Variáveis de ambiente](#variáveis-de-ambiente)
8. [Como rodar](#como-rodar)
9. [Modelos de dados](#modelos-de-dados)
10. [API — endpoints](#api--endpoints)
11. [Fluxo de autenticação](#fluxo-de-autenticação)
12. [Front-end — visões](#front-end--visões)
13. [Testes manuais (curl)](#testes-manuais-curl)
14. [Troubleshooting](#troubleshooting)
15. [Roadmap](#roadmap)
16. [Licença](#licença)

---

## Sobre o projeto

O **TaskInsight** é uma aplicação de gerenciamento de tarefas inspirada em ferramentas como Trello/Linear, com foco em três pilares:

- **Organização**: CRUD completo de tarefas com status (pendente / em andamento / concluída), prioridade (alta / média / baixa) e agrupamento por *user story*.
- **Insights**: dashboard com métricas e gráficos (Chart.js) gerados em tempo real a partir das tarefas do usuário.
- **Notebook**: ambiente Python embarcado no navegador via [Pyodide](https://pyodide.org/), permitindo análises ad-hoc sem instalar Python local.

A autenticação é feita via **JWT** com senhas hasheadas com **bcrypt**, e todas as tarefas ficam isoladas por usuário (cada usuário só vê e modifica as próprias).

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 18+ |
| Framework HTTP | Express 5 |
| Banco de dados | MongoDB (via Mongoose ODM) |
| Autenticação | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |
| Front-end | HTML5 + CSS3 + JavaScript vanilla (single-page) |
| Gráficos | Chart.js 4 |
| Notebook Python | Pyodide 0.25 |
| Dev tooling | nodemon |

---

## Funcionalidades

### Autenticação
- Cadastro de usuário (nome, e-mail, senha)
- Login com geração de token JWT (expira em 1h)
- Senha armazenada com hash bcrypt (salt 10)
- Sessão persistida em `localStorage` no front-end

### Gestão de tarefas (CRUD)
- Criar, listar, atualizar e excluir tarefas
- Cada tarefa possui: título, descrição, status, prioridade, *story* (agrupamento) e data de criação
- Filtros por status e por *story*
- Ordenação configurável
- Verificação de ownership em update/delete (usuário só altera suas tarefas)

### Dashboard de insights
- Métricas agregadas (totais por status e prioridade)
- Gráfico de pizza por status
- Gráfico de barras por prioridade
- Gráfico de linha temporal de criação

### Notebook Python (Pyodide)
- Kernel Python rodando 100% no navegador (WebAssembly)
- Células de código executáveis
- Acesso às próprias tarefas para análise

---

## Estrutura de pastas

```
projeto_final_telos/
├── backend/
│   ├── config/
│   │   └── db.js                  # Conexão Mongoose com MongoDB
│   ├── controllers/
│   │   ├── authController.js      # Register + Login
│   │   └── taskController.js      # CRUD de tarefas
│   ├── middlewares/
│   │   └── auth.js                # Validação JWT
│   ├── models/
│   │   ├── User.js                # Schema de usuário
│   │   └── Task.js                # Schema de tarefa
│   ├── routes/
│   │   ├── authRoutes.js          # Rotas públicas /api/auth
│   │   └── taskRoutes.js          # Rotas protegidas /api/tasks
│   └── server.js                  # Entrypoint Express
├── frontend/
│   └── index.html                 # SPA completa (HTML + CSS + JS inline)
├── .env                           # Variáveis de ambiente (NÃO commitar)
├── .env.example                   # Template de variáveis
├── .gitignore
├── package.json
└── README.md
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|---|---|---|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| MongoDB | 6.x (local) **ou** conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | `mongod --version` |
| Git | qualquer | `git --version` |

> **Dica**: o projeto vem configurado para MongoDB Atlas por padrão. Para rodar tudo local, basta trocar a `MONGO_URI` para `mongodb://localhost:27017/taskinsight`.

---

## Instalação e setup

### 1. Clonar o repositório

```bash
git clone <url-do-repo>
cd projeto_final_telos
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o template e preencha com seus valores:

```bash
cp .env.example .env
```

Edite o `.env` (ver [Variáveis de ambiente](#variáveis-de-ambiente)).

### 4. (Opcional) Criar o banco no Atlas

1. Crie um cluster gratuito em https://www.mongodb.com/cloud/atlas
2. Crie um usuário de banco (Database Access)
3. Libere seu IP em Network Access (`0.0.0.0/0` para dev)
4. Copie a connection string e cole em `MONGO_URI`

---

## Variáveis de ambiente

Arquivo `.env` na raiz do projeto:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskinsight
JWT_SECRET=<string-aleatoria-longa>
```

| Variável | Descrição | Como gerar |
|---|---|---|
| `PORT` | Porta HTTP do servidor | Qualquer porta livre (padrão: 5000) |
| `MONGO_URI` | String de conexão MongoDB | Painel do Atlas ou `mongodb://localhost:27017/taskinsight` |
| `JWT_SECRET` | Chave secreta para assinar tokens | `openssl rand -base64 32` |

> ⚠️ **Segurança**: nunca commite o `.env`. Ele já está no `.gitignore`. Se um segredo vazar, **rotacione imediatamente**: troque a senha do usuário Atlas e gere um novo `JWT_SECRET`.

---

## Como rodar

### Modo desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Modo produção

```bash
npm start
```

Em ambos os casos, o servidor:

1. Conecta no MongoDB (mensagem `🍃 MongoDB Conectado com sucesso` no console)
2. Sobe o Express na porta configurada
3. Tenta abrir `http://localhost:5000` no navegador automaticamente

---

## Modelos de dados

### User (`backend/models/User.js`)

```js
{
  name:     String,   // obrigatório
  email:    String,   // obrigatório, único
  password: String,   // obrigatório, armazenado com hash bcrypt
  created:  Date      // default: Date.now
}
```

### Task (`backend/models/Task.js`)

```js
{
  user:    ObjectId,   // ref: 'User', obrigatório (FK)
  title:   String,     // obrigatório
  desc:    String,     // opcional
  status:  String,     // enum: ['pendente', 'andamento', 'concluida'], default: 'pendente'
  prio:    String,     // enum: ['alta', 'media', 'baixa'], default: 'media'
  story:   String,     // opcional — agrupador (ex: "US-01")
  created: Date        // default: Date.now
}
```

---

## API — endpoints

Base URL: `http://localhost:5000/api`

### 🔓 Públicos — `/api/auth`

| Método | Rota | Descrição | Body |
|---|---|---|---|
| `POST` | `/register` | Cria usuário e retorna token | `{ name, email, pass }` |
| `POST` | `/login` | Autentica usuário e retorna token | `{ email, pass }` |

**Resposta de sucesso** (ambos):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "name": "Maria", "email": "maria@x.com" }
}
```

### 🔒 Protegidos — `/api/tasks`

Todas exigem o header `x-auth-token: <jwt>`.

| Método | Rota | Descrição | Body |
|---|---|---|---|
| `POST` | `/` | Cria tarefa | `{ title, desc?, status?, prio?, story? }` |
| `GET` | `/` | Lista tarefas do usuário logado | — |
| `PUT` | `/:id` | Atualiza tarefa (parcial) | qualquer subset dos campos editáveis |
| `DELETE` | `/:id` | Remove tarefa | — |

**Códigos de erro comuns**:

| Código | Significado |
|---|---|
| `400` | E-mail já cadastrado / credenciais inválidas |
| `401` | Token ausente, inválido, ou tarefa não pertence ao usuário |
| `404` | Tarefa não encontrada |
| `500` | Erro interno (banco fora do ar, etc.) |

---

## Fluxo de autenticação

```
┌────────────┐                      ┌────────────┐                ┌──────────┐
│  Frontend  │                      │  Backend   │                │ MongoDB  │
└─────┬──────┘                      └─────┬──────┘                └────┬─────┘
      │                                   │                            │
      │ POST /api/auth/register           │                            │
      │ { name, email, pass }             │                            │
      ├──────────────────────────────────►│                            │
      │                                   │ bcrypt.hash(pass)          │
      │                                   ├───────────────────────────►│
      │                                   │ User.save()                │
      │                                   │◄───────────────────────────┤
      │                                   │ jwt.sign({user:{id}})      │
      │ 200 { token, user }               │                            │
      │◄──────────────────────────────────┤                            │
      │                                   │                            │
      │ localStorage.setItem('token',…)   │                            │
      │                                   │                            │
      │ GET /api/tasks                    │                            │
      │ Header: x-auth-token: <jwt>       │                            │
      ├──────────────────────────────────►│                            │
      │                                   │ jwt.verify() → req.user.id │
      │                                   │ Task.find({user: id})      │
      │                                   ├───────────────────────────►│
      │                                   │◄───────────────────────────┤
      │ 200 [ ...tasks ]                  │                            │
      │◄──────────────────────────────────┤                            │
```

**Detalhes técnicos**:
- O token é enviado no header customizado **`x-auth-token`** (não `Authorization: Bearer`).
- O payload do JWT é `{ user: { id: <ObjectId> } }`.
- Expira em **1 hora** (sem refresh token na Sprint 1 — o usuário precisa logar novamente).
- O `JWT_SECRET` deve ser uma string longa e aleatória (mínimo 32 caracteres).

---

## Front-end — visões

A SPA fica em `frontend/index.html` e é servida estaticamente pelo Express. Possui três telas principais após o login:

### 1. **Tasks** (gestão de tarefas)
- Lista, cria, edita e exclui tarefas
- Filtros por status e *story*
- Ordenação configurável
- Modal de criação/edição

### 2. **Insights** (dashboard analítico)
- Cards de métricas (totais, percentuais)
- Gráfico de pizza por status
- Gráfico de barras por prioridade
- Gráfico de linha temporal

### 3. **Notebook** (ambiente Python)
- Kernel Python rodando no navegador via Pyodide (WebAssembly)
- Células de código executáveis
- Útil para análises ad-hoc sobre as tarefas

---

## Testes manuais (curl)

```bash
BASE=http://localhost:5000/api

# 1. Cadastrar
curl -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@x.com","pass":"123456"}'

# 2. Login (salvar o token retornado)
curl -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@x.com","pass":"123456"}'

# Exporte o token retornado:
TOKEN="cole-o-token-aqui"

# 3. Criar tarefa
curl -X POST $BASE/tasks \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{"title":"Estudar JWT","desc":"Revisar fluxo de auth","status":"pendente","prio":"alta","story":"US-01"}'

# 4. Listar tarefas
curl $BASE/tasks -H "x-auth-token: $TOKEN"

# 5. Atualizar tarefa (substituir <ID>)
curl -X PUT $BASE/tasks/<ID> \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{"status":"concluida"}'

# 6. Excluir tarefa
curl -X DELETE $BASE/tasks/<ID> -H "x-auth-token: $TOKEN"

# 7. Teste negativo (sem token) — deve retornar 401
curl -i $BASE/tasks
```

> **Dica**: importe esses endpoints no Postman ou Insomnia para uma experiência mais visual. Lembre-se de configurar o header `x-auth-token` no nível da coleção para reaproveitar entre requests.

---

## Troubleshooting

### `MongoServerError: bad auth` ao iniciar
- Senha do usuário Atlas incorreta na `MONGO_URI`.
- Caracteres especiais na senha precisam ser URL-encoded (`@` → `%40`, `#` → `%23`, etc).

### `MongooseServerSelectionError: connection timed out`
- IP não liberado no Network Access do Atlas. Adicione `0.0.0.0/0` (dev) ou o IP atual.

### `Error: listen EADDRINUSE :::5000`
- Porta 5000 já em uso. Troque a `PORT` no `.env` ou finalize o processo:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### `Sem token, acesso negado` (401)
- Header `x-auth-token` ausente. Não confunda com `Authorization: Bearer <token>`.

### `Token inválido` (401)
- O token expirou (1h). Faça login novamente.
- O `JWT_SECRET` do `.env` mudou após o token ser emitido.

### `npm install` falha com versão de pacote
- Algumas versões em `package.json` podem estar à frente das publicadas no npm. Remova `node_modules` e `package-lock.json`, ajuste para versões estáveis (ex: `mongoose@^8.8.0`) e reinstale.

---

## Roadmap

### Sprint 1 (atual) ✅
- [x] Cadastro e login com JWT
- [x] CRUD de tarefas
- [x] Persistência em MongoDB
- [x] SPA com dashboard e notebook

### Sprint 2 (próximos passos)
- [ ] Migrar header de auth para `Authorization: Bearer <token>` (padrão)
- [ ] Refresh tokens
- [ ] Validação de entrada com Joi ou Zod
- [ ] Rate limiting (express-rate-limit)
- [ ] Testes automatizados (Jest + Supertest)
- [ ] Documentação OpenAPI/Swagger
- [ ] Separar HTML em múltiplos arquivos / migrar para framework
- [ ] Deploy (Vercel/Render/Railway)
- [ ] CI/CD com GitHub Actions

---

## Licença

ISC — ver `package.json`.

---

**Projeto Final Telos — Inova.Ação PCD**
