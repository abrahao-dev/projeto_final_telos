# Gerenciador de Atividades e Métricas — Inova.PCD · Telos

> Projeto Final da Formação Full Stack do programa **Inova.PCD da Telos**. Aplicação web que registra, gerencia e analisa atividades de uma iniciativa corporativa de inclusão de pessoas com deficiência.

---

## Sumário

1. [Sobre o projeto](#sobre-o-projeto)
2. [Stack](#stack)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Pré-requisitos](#pré-requisitos)
5. [Setup](#setup)
6. [Variáveis de ambiente](#variáveis-de-ambiente)
7. [Como rodar](#como-rodar)
8. [Schema dos dados](#schema-dos-dados)
9. [Contrato da API](#contrato-da-api)
10. [Filtros da listagem](#filtros-da-listagem)
11. [Fluxo de autenticação JWT](#fluxo-de-autenticação-jwt)
12. [Front-end](#front-end)
13. [Dataset](#dataset)
14. [Testes manuais (curl)](#testes-manuais-curl)
15. [Mapeamento aula → sprint](#mapeamento-aula--sprint)
16. [Definition of Done por sprint](#definition-of-done-por-sprint)
17. [Troubleshooting](#troubleshooting)
18. [Roadmap](#roadmap)
19. [Licença](#licença)

---

## Sobre o projeto

O **Gerenciador de Atividades Inova.PCD** consolida na prática os conhecimentos da formação Full Stack da Telos (Níveis 1 a 8). É um **Gerenciador de Atividades e Métricas** focado em três pilares:

- **Organização** — CRUD completo de tarefas com status, prioridade, categoria (eixos da iniciativa) e público-alvo.
- **Métricas** — Dashboard em tempo real com taxa de conclusão, lead time, distribuição por status/categoria/prioridade e top tarefas em andamento mais antigas.
- **Análise** — Notebook Python embarcado no navegador (Pyodide) com `pandas`, já com os datasets pré-carregados.

A autenticação usa **JWT** com senhas hasheadas com **bcrypt**. Cada usuário só vê e modifica as próprias tarefas (validação via `criadoPor` em todos os endpoints protegidos).

> 📚 Tudo aqui amarra ao que já foi visto no curso — Níveis 7 e 8 (Node + Express + Mongoose + MongoDB Atlas) e Nível 5 (Python/Pandas). Veja [Mapeamento aula → sprint](#mapeamento-aula--sprint).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 18+ |
| Framework HTTP | Express 5 |
| Banco de dados | MongoDB (via Mongoose 8 / MongoDB Atlas) |
| Autenticação | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |
| Front-end | HTML5 + CSS3 + JavaScript vanilla (single-page) |
| Gráficos | Chart.js 4 |
| Notebook Python | Pyodide 0.25 (WebAssembly) + Pandas |
| Dev tooling | nodemon · dotenv · open |

---

## Estrutura de pastas

```
projeto_final_telos/
├── backend/
│   ├── config/
│   │   └── db.js                  # connectDB() — encapsula mongoose.connect()
│   ├── controllers/
│   │   ├── authController.js      # register + login (bcrypt + JWT)
│   │   ├── taskController.js      # CRUD com filtros + getById
│   │   └── metricsController.js   # aggregate de métricas (GET /api/metrics)
│   ├── middlewares/
│   │   └── auth.js                # valida JWT (header x-auth-token)
│   ├── models/
│   │   ├── User.js                # nome, email, senhaHash, criadoEm, atualizadoEm
│   │   └── Task.js                # 12 campos + enums + ref criadoPor
│   ├── routes/
│   │   ├── authRoutes.js          # POST /auth/register, /auth/login
│   │   ├── taskRoutes.js          # GET/POST/PUT/DELETE /api/tasks
│   │   └── metricsRoutes.js       # GET /api/metrics
│   ├── scripts/
│   │   └── seed.js                # popula 65 tarefas do CSV (12 campos cheios)
│   └── server.js                  # entrypoint Express
├── frontend/
│   ├── index.html                 # SPA (HTML + CSS + JS inline)
│   └── datasets/
│       ├── atividades.csv         # 65 atividades
│       ├── responsaveis.csv       # 8 responsáveis
│       └── status_historico.csv   # 138 transições
├── datasets/
│   └── DATASET.md                 # documentação do dataset
├── .env                           # NÃO commitar (gitignored)
├── .env.example                   # template
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Pré-requisitos

| Ferramenta | Versão | Como verificar |
|---|---|---|
| Node.js | 18.x+ | `node --version` |
| npm | 9.x+ | `npm --version` |
| Git | qualquer | `git --version` |
| MongoDB Atlas | conta gratuita (plano M0) | https://www.mongodb.com/cloud/atlas |

> Para rodar Mongo localmente em vez do Atlas: `MONGO_URI=mongodb://localhost:27017/inovapcd`.

---

## Setup

```bash
git clone <url-do-repo>
cd projeto_final_telos
npm install
cp .env.example .env
# editar o .env com sua MONGO_URI e gerar JWT_SECRET
npm run seed     # popula 65 tarefas no usuário prof@telos.com / 123456
npm run dev      # sobe o servidor + abre o browser
```

### Criar o cluster no Atlas (Aula 09 · Nível 8)

1. Criar conta em https://www.mongodb.com/cloud/atlas
2. Criar cluster gratuito **M0**
3. **Database Access** → criar usuário com senha (anote)
4. **Network Access** → liberar IP (em sala: `0.0.0.0/0`)
5. **Connect → Drivers** → copiar a connection string (`mongodb+srv://...`)
6. Colar no `.env` em `MONGO_URI` (substituir `<password>` pela senha real)

---

## Variáveis de ambiente

Arquivo `.env` na raiz:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/inovapcd?retryWrites=true&w=majority
JWT_SECRET=string-longa-e-aleatoria
```

| Variável | Descrição | Como gerar |
|---|---|---|
| `PORT` | Porta HTTP | Qualquer porta livre (default 5000) |
| `MONGO_URI` | String de conexão MongoDB | Painel Atlas → Connect → Drivers |
| `JWT_SECRET` | Chave para assinar tokens | `openssl rand -base64 32` |

> ⚠️ Nunca commite o `.env`. Já está no `.gitignore`. Se um segredo vazar, **rotacione**: troca a senha do user Atlas e gera novo `JWT_SECRET`.

---

## Como rodar

```bash
npm run dev      # com auto-reload via nodemon
npm start        # modo produção
npm run seed     # popula MongoDB com 65 tarefas reais
```

Saída esperada:

```
🍃 MongoDB Conectado com sucesso
🚀 Servidor rodando em http://localhost:5000
```

O navegador abre automaticamente em `http://localhost:5000`.

---

## Schema dos dados

### User (`backend/models/User.js`)

```js
{
  _id:          ObjectId,
  nome:         String,    // obrigatório
  email:        String,    // obrigatório, único, lowercase
  senhaHash:    String,    // obrigatório, bcrypt salt 10
  criadoEm:     Date,      // default: now
  atualizadoEm: Date       // hook pre-save
}
```

### Task (`backend/models/Task.js`)

```js
{
  _id:               ObjectId,
  titulo:            String,    // obrigatório
  descricao:         String,
  status:            String,    // enum: 'pendente' | 'andamento' | 'concluida'  (default pendente)
  prioridade:        String,    // enum: 'alta' | 'media' | 'baixa'  (default media)
  categoria:         String,    // enum: 7 eixos da iniciativa (obrigatório)
  publico_alvo:      String,    // enum: Visual | Auditiva | Motora | Intelectual | Geral
  responsavel:       String,
  papel_responsavel: String,
  estimativa_horas:  Number,    // default 0
  horas_gastas:      Number,    // default 0
  data_criacao:      Date,      // default: now
  data_prevista:     Date | null,
  data_conclusao:    Date | null,  // auto-preenchido ao virar 'concluida'
  criadoPor:         ObjectId ref 'User'  // obrigatório, indexado
}
```

**Categorias (enum)**: `Acessibilidade Digital`, `Inclusao na Empregabilidade`, `Tecnologia Assistiva`, `Comunicacao Inclusiva`, `Capacitacao de Equipes`, `Adaptacao de Ambiente Fisico`, `Plataforma Interna`.

---

## Contrato da API

Base: `http://localhost:5000`. Espelha 1:1 a tabela §"Endpoints da API" do material de aula.

### 🔓 Públicos — `/auth`

| Método | Rota | Body | Resposta |
|---|---|---|---|
| `POST` | `/auth/register` | `{ nome, email, senha }` | `201 { token, user: { nome, email } }` |
| `POST` | `/auth/login` | `{ email, senha }` | `200 { token, user: { nome, email } }` |

### 🔒 Protegidos — `/api/*`

Todas exigem header **`x-auth-token: <jwt>`**.

| Método | Rota | Descrição |
|---|---|---|
| `GET`    | `/api/tasks` | Lista tarefas do usuário (filtros — ver abaixo) |
| `GET`    | `/api/tasks/:id` | Detalhe de uma tarefa |
| `POST`   | `/api/tasks` | Cria tarefa. `201` + objeto |
| `PUT`    | `/api/tasks/:id` | Atualiza (parcial) |
| `DELETE` | `/api/tasks/:id` | Apaga. `204` (sem corpo) |
| `GET`    | `/api/metrics` | Indicadores agregados (dashboard) |

Códigos de erro:

| Código | Significado |
|---|---|
| `400` | Validação (e-mail duplicado, senha curta, campo enum inválido, categoria ausente) |
| `401` | Token ausente/inválido OU tarefa pertence a outro usuário |
| `404` | Tarefa não encontrada (ou ID inválido) |
| `500` | Erro interno (banco fora, etc.) |

---

## Filtros da listagem

`GET /api/tasks` aceita os seguintes query params (RF03 + RF09):

| Param | Valores | Exemplo |
|---|---|---|
| `status` | `pendente` \| `andamento` \| `concluida` | `?status=andamento` |
| `categoria` | uma das 7 categorias | `?categoria=Acessibilidade%20Digital` |
| `prioridade` | `alta` \| `media` \| `baixa` | `?prioridade=alta` |
| `publico_alvo` | `Visual` \| `Auditiva` \| `Motora` \| `Intelectual` \| `Geral` | `?publico_alvo=Visual` |
| `q` | busca case-insensitive em `titulo` | `?q=contraste` |

Combináveis: `?status=pendente&categoria=Plataforma%20Interna&q=dashboard`.

---

## Fluxo de autenticação JWT

```
1) POST /auth/login                        2) Toda request /api/*
   { email, senha }                           Header: x-auth-token: <jwt>
        │                                            │
        ▼                                            ▼
   bcrypt.compare(senha, senhaHash)            middlewares/auth.js
        │                                            │
        ▼                                            ▼
   jwt.sign({ user: { id } }, SECRET, 1h)      jwt.verify(token, SECRET)
        │                                            │
        ▼                                            ▼
   { token, user: { nome, email } }            req.user = decoded.user
                                                     │
                                                     ▼
                                               controller filtra por
                                               criadoPor = req.user.id
```

Detalhes:
- Header **`x-auth-token`** (não `Authorization: Bearer`).
- Payload: `{ user: { id: <ObjectId> } }`.
- Expira em **1h**.
- `JWT_SECRET` deve ter ≥32 caracteres aleatórios.

---

## Front-end

SPA em `frontend/index.html`. Após o login, três abas:

### 1. Tarefas
- Lista filtrada por status / categoria / prioridade / busca por título.
- Cards mostram título, descrição, badges de status/prioridade/categoria/público, responsável e data de criação.
- Click no círculo = avança status (`pendente → andamento → concluida → pendente`).
- Modal de criar/editar com todos os 12 campos.

### 2. Insights
Consome `GET /api/metrics`:
- 4 cards: total, taxa de conclusão, lead time médio (dias), em andamento.
- Gráfico **doughnut** por status (Chart.js).
- Gráfico **bar** por prioridade.
- Gráfico **bar horizontal** por categoria (7 eixos).
- Lista das 5 tarefas em andamento há mais tempo.

### 3. Notebook Python
- Pyodide carrega Pandas no navegador (WebAssembly).
- `df` (atividades) e `resp` (responsáveis) já vêm carregados via `/datasets/*.csv`.
- Célula inicial com exemplo de groupby de taxa de conclusão.

### Acessibilidade (RNF01 da aula)
- Skip link `Pular para o conteúdo`.
- `label for=…` em todos os inputs.
- `aria-label` nos botões só com ícone.
- Roles e `aria-selected` nas abas.
- Contraste AA na paleta dark.
- Navegação completa por teclado (Tab/Shift+Tab/Enter/Esc).

### Responsividade (RNF02)
- Layout fluido de 360px (mobile) a 1440px+ (desktop).
- Filtros viram coluna em telas estreitas.
- Modais cabem em viewport pequena (scroll interno).

---

## Dataset

Detalhes completos em [`datasets/DATASET.md`](datasets/DATASET.md). Resumo:

| Arquivo | Linhas | Uso |
|---|---|---|
| `frontend/datasets/atividades.csv` | 65 | Tarefas reais (popula via seed) |
| `frontend/datasets/responsaveis.csv` | 8 | Para exercitar JOIN em Pandas |
| `frontend/datasets/status_historico.csv` | 138 | Transições de status (Sprint 3) |

---

## Testes manuais (curl)

```bash
BASE=http://localhost:5000

# 1. Cadastrar
curl -X POST $BASE/auth/register -H "Content-Type: application/json" \
  -d '{"nome":"Ana Ribeiro","email":"ana@telos.com","senha":"senha123"}'

# 2. Login (capturar token)
TOKEN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ana@telos.com","senha":"senha123"}' | jq -r .token)

# 3. Criar tarefa
curl -X POST $BASE/api/tasks \
  -H "Content-Type: application/json" -H "x-auth-token: $TOKEN" \
  -d '{
    "titulo":"Auditar contraste do portal RH",
    "descricao":"Validar WCAG AA nos textos e botoes principais",
    "categoria":"Acessibilidade Digital",
    "prioridade":"alta",
    "publico_alvo":"Visual",
    "responsavel":"Ana Ribeiro",
    "papel_responsavel":"Dev Front",
    "estimativa_horas":8
  }'

# 4. Listar com filtros (RF03)
curl "$BASE/api/tasks?status=pendente&categoria=Acessibilidade%20Digital&q=contraste" \
  -H "x-auth-token: $TOKEN"

# 5. Detalhe
curl $BASE/api/tasks/<ID> -H "x-auth-token: $TOKEN"

# 6. Atualizar (vira concluída — data_conclusao preenche auto)
curl -X PUT $BASE/api/tasks/<ID> \
  -H "Content-Type: application/json" -H "x-auth-token: $TOKEN" \
  -d '{"status":"concluida","horas_gastas":9}'

# 7. Métricas
curl $BASE/api/metrics -H "x-auth-token: $TOKEN" | jq

# 8. Apagar
curl -X DELETE $BASE/api/tasks/<ID> -H "x-auth-token: $TOKEN" -i
# → HTTP 204

# 9. Teste negativo (sem token)
curl -i $BASE/api/tasks
# → 401 { "msg": "Sem token, acesso negado" }
```

Importe esses requests no Postman / Insomnia configurando `x-auth-token` no nível da coleção.

---

## Mapeamento aula → sprint

| Aula da formação | Onde aparece aqui |
|---|---|
| **Nível 7 · Aulas 12–14** — Estruturando API: rotas, CRUD, organização | `backend/routes/*`, `backend/controllers/*`, separação config/models/routes/controllers/middlewares |
| **Nível 8 · Aulas 02, 03** — Login + JWT | `authController.js` (bcrypt + `jwt.sign`) + `middlewares/auth.js` (`jwt.verify`) |
| **Nível 8 · Aula 04** — Variáveis de ambiente | `dotenv` no `server.js`, `.env.example` versionado |
| **Nível 8 · Aulas 07, 10, 11** — Mongoose: conexão, CRUD, hooks | `config/db.js`, `models/*.js` (hook `pre-save` em `User`) |
| **Nível 8 · Aula 09** — MongoDB Atlas | Setup `MONGO_URI`, fluxo Compass no `DATASET.md` |
| **Nível 8 · Aula 12** — CRUD de Filmes | Mesma estrutura — trocamos "Filme" por "Task" e adicionamos campos da iniciativa |
| **Nível 5 · Aulas 03–04 + 17–19** — Pandas, agregações, viz | Aba Notebook Python no front (Pyodide + Pandas) |
| **Nível 2 · Aula 9** — Sites acessíveis | Skip link, labels, ARIA, contraste AA |
| **Nível 1 · Aulas 18–20** — Promises | `fetch + async/await` em todo o front |

---

## Definition of Done por sprint

### Sprint 1 · Back-end + Mongo (atual ✅)
- [x] 8 endpoints respondendo (`/auth/register`, `/auth/login`, `GET/POST/PUT/DELETE /api/tasks`, `GET /api/tasks/:id`, `GET /api/metrics`)
- [x] JWT validado em rotas `/api/*`
- [x] Senha sempre como `senhaHash` no banco
- [x] 65 tarefas importadas via `npm run seed`
- [x] README com instruções de execução
- [ ] Commits diários no GitHub (responsabilidade da squad)

### Sprint 2 · Front-end
- [x] 5 telas (Login, Cadastro, Lista, Modal Criar/Editar, Insights) implementadas
- [x] Integração real com a API (sem mocks)
- [x] Login funciona ponta a ponta
- [x] Navegação por teclado em todos os controles
- [x] Layout usável em 360px e 1440px
- [x] Contraste AA verificável (paleta dark com `--text2: #b6c1d2` sobre `--bg2: #1a1d27` ≈ 11:1)

### Sprint 3 · Dados + demo
- [x] Notebook Python embarcado com `df` e `resp` pré-carregados
- [ ] Pelo menos 3 análises rodando no notebook (responsabilidade da squad)
- [ ] Gráficos salvos como PNG para o slide
- [ ] Pelo menos 1 análise com JOIN entre `df` e `resp`
- [ ] Demo ensaiada com fluxo único de ~5 min
- [ ] Backup local rodando (caso a internet caia)
- [ ] Cada integrante sabe explicar a parte de outro colega

---

## Troubleshooting

### `MongoServerError: bad auth` ao iniciar
- Senha do usuário Atlas incorreta na `MONGO_URI`.
- Caracteres especiais precisam ser URL-encoded (`@` → `%40`, `#` → `%23`).

### `MongooseServerSelectionError: connection timed out`
- IP não liberado no Network Access do Atlas. Libere `0.0.0.0/0` para dev.

### `Error: listen EADDRINUSE :::5000`
- Porta 5000 em uso. Mude `PORT` no `.env` ou:
  - macOS/Linux: `lsof -ti:5000 | xargs kill -9`
  - Windows PS: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process`

### `Sem token, acesso negado` (401)
- Header `x-auth-token` ausente. **Não confunda** com `Authorization: Bearer`.

### `Token inválido` (401)
- Token expirou (1h). Faça login novamente.
- `JWT_SECRET` do `.env` foi trocado após o token ser emitido.

### Front-end carrega lista vazia mesmo após `npm run seed`
- O seed popula o usuário `prof@telos.com` / `123456`. Faça login com essas credenciais (ou rode um `updateMany` para mover `criadoPor`).

### `npm install` falha
- Apague `node_modules` e `package-lock.json`, ajuste versões para estáveis (ex.: `mongoose@^8.8.0`), reinstale.

---

## Roadmap

### Sprint 2 — extras
- [ ] Migrar header de auth para `Authorization: Bearer <token>` (padrão de mercado)
- [ ] Refresh tokens
- [ ] Validação de entrada com Joi ou Zod
- [ ] Rate limiting (`express-rate-limit`)
- [ ] Testes automatizados (Jest + Supertest)
- [ ] Documentação OpenAPI/Swagger
- [ ] Deploy (Vercel / Render / Railway)
- [ ] CI/CD com GitHub Actions

### Sprint 3 — extras
- [ ] Importar `status_historico.csv` para uma collection `transitions` e expor `/api/timeline`
- [ ] Exportar CSV das métricas direto pelo dashboard (US10)
- [ ] Export PNG dos gráficos (Chart.js `toBase64Image`)

---

## Licença

ISC — ver `package.json`.

---

**Projeto Final · Telos — Programa Inova.PCD**
