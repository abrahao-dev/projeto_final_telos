require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Task = require('../models/Task');
const User = require('../models/User');

const DEMO_EMAIL = 'prof@telos.com';
const DEMO_SENHA = '123456';
const CSV_PATH = path.join(__dirname, '../../frontend/datasets/atividades.csv');

function parseLinha(linha) {
    const campos = [];
    let atual = '';
    let dentroAspas = false;
    for (let i = 0; i < linha.length; i++) {
        const c = linha[i];
        if (c === '"' && linha[i + 1] === '"' && dentroAspas) {
            atual += '"';
            i++;
        } else if (c === '"') {
            dentroAspas = !dentroAspas;
        } else if (c === ',' && !dentroAspas) {
            campos.push(atual);
            atual = '';
        } else {
            atual += c;
        }
    }
    campos.push(atual);
    return campos;
}

function parseData(s) {
    if (!s || !s.trim()) return null;
    return new Date(s.trim());
}

function parseInt0(s) {
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 0;
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🍃 Conectado ao MongoDB');

    let demo = await User.findOne({ email: DEMO_EMAIL });
    if (!demo) {
        const senhaHash = await bcrypt.hash(DEMO_SENHA, 10);
        demo = await User.create({
            nome: 'Prof Telos',
            email: DEMO_EMAIL,
            senhaHash
        });
        console.log(`👤 Usuário demo criado: ${DEMO_EMAIL} / ${DEMO_SENHA}`);
    } else {
        console.log(`👤 Usuário demo já existe: ${DEMO_EMAIL}`);
    }

    const conteudo = fs.readFileSync(CSV_PATH, 'utf-8').trim();
    const linhas = conteudo.split('\n');
    const cabecalho = parseLinha(linhas[0]);

    const removidas = await Task.deleteMany({ criadoPor: demo._id });
    console.log(`🧹 ${removidas.deletedCount} tarefas antigas removidas`);

    const tasks = linhas.slice(1).map(linha => {
        const valores = parseLinha(linha);
        const o = Object.fromEntries(cabecalho.map((c, i) => [c, valores[i]]));
        return {
            criadoPor: demo._id,
            titulo: o.titulo,
            descricao: o.descricao,
            categoria: o.categoria,
            status: o.status,
            prioridade: o.prioridade,
            responsavel: o.responsavel,
            papel_responsavel: o.papel_responsavel,
            publico_alvo: o.publico_alvo,
            estimativa_horas: parseInt0(o.estimativa_horas),
            horas_gastas: parseInt0(o.horas_gastas),
            data_criacao: parseData(o.data_criacao) || new Date(),
            data_conclusao: parseData(o.data_conclusao)
        };
    });

    await Task.insertMany(tasks);
    console.log(`✅ ${tasks.length} tarefas inseridas para ${demo.email}`);
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
});
