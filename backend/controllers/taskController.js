const Task = require('../models/Task');

// CRIAR TAREFA
exports.createTask = async (req, res) => {
    try {
        const { title, desc, status, prio, story } = req.body;

        const newTask = new Task({
            title,
            desc,
            status,
            prio,
            story: story !== undefined ? story : '',
            user: req.user.id // ID vindo do token JWT
        });

        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        res.status(500).send('Erro ao salvar tarefa');
    }
};

// BUSCAR TAREFAS DO USUÁRIO
exports.getTasks = async (req, res) => {
    try {
        // Busca apenas as tarefas onde o campo 'user' é igual ao ID do logado
        const tasks = await Task.find({ user: req.user.id }).sort({ created: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Erro ao buscar tarefas');
    }
};

// ATUALIZAR TAREFA
exports.updateTask = async (req, res) => {
    try {
        const { title, desc, status, prio, story } = req.body;
        
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Tarefa não encontrada' });
        }

        // Verificar se a tarefa pertence ao usuário logado
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado' });
        }

        if (title !== undefined) task.title = title;
        if (desc !== undefined) task.desc = desc;
        if (status !== undefined) task.status = status;
        if (prio !== undefined) task.prio = prio;
        if (story !== undefined) task.story = story;

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).send('Erro ao atualizar tarefa');
    }
};

// EXCLUIR TAREFA
exports.deleteTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Tarefa não encontrada' });
        }

        // Verificar se a tarefa pertence ao usuário logado
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Tarefa removida com sucesso' });
    } catch (err) {
        res.status(500).send('Erro ao excluir tarefa');
    }
};