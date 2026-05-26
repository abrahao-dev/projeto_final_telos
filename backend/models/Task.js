const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    // Referência ao ID do usuário dono da tarefa
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    desc: { type: String }, // Bate com seu HTML
    status: {
        type: String,
        enum: ['pendente', 'andamento', 'concluida'],
        default: 'pendente'
    },
    prio: {
        type: String,
        enum: ['alta', 'media', 'baixa'],
        default: 'media'
    },
    story: {
        type: String,
        default: ''
    },
    created: { type: Date, default: Date.now } // Bate com seu HTML
});

module.exports = mongoose.model('Task', TaskSchema);