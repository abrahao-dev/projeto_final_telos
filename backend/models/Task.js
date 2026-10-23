const mongoose = require('mongoose');

const CATEGORIAS = [
    'Acessibilidade Digital',
    'Inclusao na Empregabilidade',
    'Tecnologia Assistiva',
    'Comunicacao Inclusiva',
    'Capacitacao de Equipes',
    'Adaptacao de Ambiente Fisico',
    'Plataforma Interna'
];

const PUBLICOS_ALVO = ['Visual', 'Auditiva', 'Motora', 'Intelectual', 'Geral'];

const TaskSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, default: '', trim: true },
    status: {
        type: String,
        enum: ['pendente', 'andamento', 'concluida'],
        default: 'pendente'
    },
    prioridade: {
        type: String,
        enum: ['alta', 'media', 'baixa'],
        default: 'media'
    },
    categoria: {
        type: String,
        enum: CATEGORIAS,
        required: true
    },
    publico_alvo: {
        type: String,
        enum: PUBLICOS_ALVO,
        default: 'Geral'
    },
    responsavel: { type: String, default: '', trim: true },
    papel_responsavel: { type: String, default: '', trim: true },
    estimativa_horas: { type: Number, default: 0, min: 0 },
    horas_gastas: { type: Number, default: 0, min: 0 },
    data_criacao: { type: Date, default: Date.now },
    data_prevista: { type: Date, default: null },
    data_conclusao: { type: Date, default: null },
    criadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
});

TaskSchema.statics.CATEGORIAS = CATEGORIAS;
TaskSchema.statics.PUBLICOS_ALVO = PUBLICOS_ALVO;

module.exports = mongoose.model('Task', TaskSchema);
