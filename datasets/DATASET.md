# Dataset — Iniciativa de Inclusão PCD

Conjunto de dados curado para o **Projeto Final da Formação Full Stack** da **Telos — Programa Inova.PCD**. Idêntico ao repositório oficial [`inova-pcd-dataset`](https://github.com/abrahao-dev/inova-pcd-dataset).

> 🎯 **Por que esse tema?** O projeto é um **Gerenciador de Atividades e Métricas**. Em vez de dados genéricos, o dataset simula tarefas reais de uma iniciativa corporativa de inclusão de pessoas com deficiência (PCD). O exercício técnico fica alinhado ao propósito do programa.

---

## Arquivos

| Arquivo | Linhas | Colunas | Uso |
|---|---|---|---|
| `atividades.csv` | 65 | 13 | Dataset principal — popula a collection `tasks` (Sprint 1) e alimenta dashboard (Sprint 2) e análise (Sprint 3) |
| `responsaveis.csv` | 8 | 5 | Tabela auxiliar para exercitar **JOIN** com `atividades` |
| `status_historico.csv` | 138 | 4 | Log de transições `pendente → andamento → concluida` — opcional, séries temporais (Sprint 3) |

Local: `frontend/datasets/`. Servidos estaticamente pelo Express em `/datasets/<arquivo>.csv` — Pyodide e o front lêem direto.

---

## 🧩 Conexão com o projeto

```
                ┌─────────────────────────┐
                │  atividades.csv  (CSV)  │
                └────────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│ POPULAR      │    │ ANALISAR     │    │ VISUALIZAR     │
│ MongoDB via  │    │ com Python   │    │ no front-end   │
│ npm run seed │    │ (Pyodide)    │    │ (Chart.js)     │
└──────────────┘    └──────────────┘    └────────────────┘
   Sprint 1            Sprint 3            Sprint 2
```

---

## 📋 Schema `atividades.csv` (1:1 com `Task` no Mongoose)

O schema da `Task` foi desenhado em PT para **bater direto** com o CSV — zero conversão na importação via Compass.

| Coluna do CSV | Campo da `Task` | Tipo | Observação |
|---|---|---|---|
| `id` | (descartado no Mongo, gera `_id`) | int | |
| `titulo` | `titulo` | String, obrigatório | |
| `descricao` | `descricao` | String | |
| `categoria` | `categoria` | enum (7 valores) | Eixo da iniciativa |
| `status` | `status` | enum: `pendente`/`andamento`/`concluida` | default `pendente` |
| `prioridade` | `prioridade` | enum: `alta`/`media`/`baixa` | default `media` |
| `responsavel` | `responsavel` | String | Chave para JOIN com `responsaveis.csv` |
| `papel_responsavel` | `papel_responsavel` | String | |
| `publico_alvo` | `publico_alvo` | enum: `Visual`/`Auditiva`/`Motora`/`Intelectual`/`Geral` | |
| `estimativa_horas` | `estimativa_horas` | Number | |
| `horas_gastas` | `horas_gastas` | Number | |
| `data_criacao` | `data_criacao` | Date | |
| `data_conclusao` | `data_conclusao` | Date \| null | Vazio se ainda não concluída |

Campo extra controlado pelo back-end:

| Campo | Tipo | Origem |
|---|---|---|
| `criadoPor` | ObjectId ref `User`, obrigatório | Vem do JWT |
| `data_prevista` | Date \| null | Preenchido pela UI |

### Categorias (7 eixos)

| Categoria | Descrição |
|---|---|
| `Acessibilidade Digital` | WCAG, ARIA, leitores de tela, contraste |
| `Inclusao na Empregabilidade` | Lei 8.213/91, processo seletivo inclusivo |
| `Tecnologia Assistiva` | Hardware/software adaptados |
| `Comunicacao Inclusiva` | Libras, audiodescrição, linguagem acessível |
| `Capacitacao de Equipes` | Treinamentos, workshops, sensibilização |
| `Adaptacao de Ambiente Fisico` | Rampas, banheiros, sinalização tátil |
| `Plataforma Interna` | Ferramentas, dashboards, automações |

### Distribuição (`atividades.csv`)

```
Status:        46% concluída  |  34% pendente   |  20% andamento
Prioridade:    49% média      |  29% baixa      |  22% alta
Público-alvo:  43% Geral      |  23% Auditiva   |  14% Motora  |  12% Visual  |  8% Intelectual
Período:       novembro/2025 a maio/2026
```

---

## 👥 Schema `responsaveis.csv`

| Coluna | Tipo | Descrição |
|---|---|---|
| `nome` | string | Chave de junção com `atividades.responsavel` |
| `papel` | string | Cargo |
| `departamento` | string | Tecnologia, Produto, Pessoas e Cultura, Marketing |
| `anos_empresa` | int | Tempo de casa |
| `formacao_acessibilidade` | `sim`/`nao` | Possui formação específica? |

---

## 🕒 Schema `status_historico.csv`

Log de cada transição de status — útil para análise temporal (Sprint 3).

| Coluna | Descrição |
|---|---|
| `task_id` | FK com `atividades.id` |
| `status_anterior` | Status antes (vazio na criação) |
| `status_novo` | Novo status |
| `data_mudanca` | `YYYY-MM-DD` |

---

## 🚀 Como popular o MongoDB (Sprint 1)

### Opção A — Script seed (recomendado neste projeto)

```bash
npm run seed
```

Cria o usuário demo `prof@telos.com` / `123456` e insere 65 tarefas com **todos** os 12 campos. Idempotente: roda de novo limpa as antigas antes de inserir.

### Opção B — MongoDB Compass (método da Aula 09 · Nível 8)

1. Abrir Compass com a connection string do Atlas
2. Criar banco `inovapcd` → collection `tasks`
3. `Add Data → Import JSON or CSV file` → `frontend/datasets/atividades.csv`
4. Marcar CSV + "First row is header" → confirmar
5. Pronto, 65 docs importados

> ⚠️ Pela opção B, as tarefas ficam **sem** `criadoPor` — não aparecem no front (que filtra por user). Use a opção A para popular num usuário demo, ou rode `updateMany({}, { $set: { criadoPor: ObjectId('...') } })` no mongosh.

---

## 🐍 Análise em Python (Sprint 3)

### Notebook embarcado (Pyodide — automático no app)

Ao abrir a aba **Notebook Python**, o kernel carrega `df` (atividades) e `resp` (responsáveis) automaticamente.

```python
# 1. Taxa de conclusão por categoria
df.groupby('categoria')['status'].apply(
    lambda s: (s == 'concluida').mean() * 100
).round(1).sort_values(ascending=False)

# 2. Gap entre estimativa e realidade
c = df[df['status'] == 'concluida'].copy()
c['delta_horas'] = c['horas_gastas'] - c['estimativa_horas']
print(f"Gap medio: {c['delta_horas'].mean():.1f}h")

# 3. JOIN: pessoas com formação entregam mais rápido?
merged = df.merge(resp, left_on='responsavel', right_on='nome')
merged['data_criacao']   = pd.to_datetime(merged['data_criacao'])
merged['data_conclusao'] = pd.to_datetime(merged['data_conclusao'])
merged['lead_time']      = (merged['data_conclusao'] - merged['data_criacao']).dt.days
merged.groupby('formacao_acessibilidade')['lead_time'].mean()
```

### Em Python local (`analise.py`)

```python
import pandas as pd
ativ = pd.read_csv('frontend/datasets/atividades.csv')
resp = pd.read_csv('frontend/datasets/responsaveis.csv')
df = ativ.merge(resp, left_on='responsavel', right_on='nome')
```

### 10 análises sugeridas (README do dataset)

1. Distribuição por status
2. Distribuição por categoria
3. Distribuição por público-alvo
4. Taxa de conclusão por categoria
5. Horas estimadas vs reais (gap)
6. Carga por responsável
7. Departamentos que mais entregam
8. Formação em acessibilidade × velocidade
9. Lead time médio mensal (usa `status_historico.csv`)
10. Tarefas "presas" em andamento por muito tempo

---

## ⚠️ Limitações

- Dataset sintético plausível: não representa empresa real.
- Período curto (~6 meses): bom para descritiva, limitado para tendências de longo prazo.
- Nomes de responsáveis fictícios.

---

## 📚 Referências

- **LBI** — Lei 13.146/2015
- **Lei de Cotas** — Lei 8.213/91, Art. 93
- **WCAG 2.1** — Web Content Accessibility Guidelines (W3C)
- **eMAG** — Modelo de Acessibilidade em Governo Eletrônico

---

**Mantido por**: Telos — Programa Inova.PCD
