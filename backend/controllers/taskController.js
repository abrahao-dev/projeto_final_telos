const mongoose = require('mongoose');
const Task = require('../models/Task');

const CAMPOS_EDITAVEIS = [
    'titulo', 'descricao', 'status', 'prioridade', 'categoria',
    'publico_alvo', 'responsavel', 'papel_responsavel',
    'estimativa_horas', 'horas_gastas',
    'data_criacao', 'data_prevista', 'data_conclusao'
];

function pickCampos(body) {
    const out = {};
    for (const k of CAMPOS_EDITAVEIS) {
        if (body[k] !== undefined) out[k] = body[k];
    }
    return out;
}

exports.createTask = async (req, res) => {
    try {
        const dados = pickCampos(req.body);
        if (!dados.titulo) return res.status(400).json({ msg: 'Título é obrigatório.' });
        if (!dados.categoria) return res.status(400).json({ msg: 'Categoria é obrigatória.' });

        if (dados.status === 'concluida' && !dados.data_conclusao) {
            dados.data_conclusao = new Date();
        }

        const task = await Task.create({ ...dados, criadoPor: req.user.id });
        res.status(201).json(task);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        console.error(err);
        res.status(500).json({ msg: 'Erro ao salvar tarefa.' });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { status, categoria, prioridade, publico_alvo, q } = req.query;
        const filtro = { criadoPor: req.user.id };

        if (status) filtro.status = status;
        if (categoria) filtro.categoria = categoria;
        if (prioridade) filtro.prioridade = prioridade;
        if (publico_alvo) filtro.publico_alvo = publico_alvo;
        if (q) filtro.titulo = { $regex: q.trim(), $options: 'i' };

        const tasks = await Task.find(filtro).sort({ data_criacao: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao buscar tarefas.' });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ msg: 'Tarefa não encontrada.' });
        }
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Tarefa não encontrada.' });
        if (task.criadoPor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado.' });
        }
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao buscar tarefa.' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ msg: 'Tarefa não encontrada.' });
        }
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Tarefa não encontrada.' });
        if (task.criadoPor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado.' });
        }

        const dados = pickCampos(req.body);

        if (dados.status === 'concluida' && task.status !== 'concluida' && !dados.data_conclusao) {
            dados.data_conclusao = new Date();
        }
        if (dados.status && dados.status !== 'concluida' && task.status === 'concluida' && dados.data_conclusao === undefined) {
            dados.data_conclusao = null;
        }

        Object.assign(task, dados);
        await task.save();
        res.json(task);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        console.error(err);
        res.status(500).json({ msg: 'Erro ao atualizar tarefa.' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ msg: 'Tarefa não encontrada.' });
        }
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Tarefa não encontrada.' });
        if (task.criadoPor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado.' });
        }
        await task.deleteOne();
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao excluir tarefa.' });
    }
};
