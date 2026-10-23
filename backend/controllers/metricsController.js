const mongoose = require('mongoose');
const Task = require('../models/Task');

exports.getMetrics = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const [agg] = await Task.aggregate([
            { $match: { criadoPor: userId } },
            {
                $facet: {
                    total: [{ $count: 'n' }],
                    porStatus: [
                        { $group: { _id: '$status', n: { $sum: 1 } } },
                        { $project: { _id: 0, status: '$_id', n: 1 } }
                    ],
                    porCategoria: [
                        { $group: { _id: '$categoria', n: { $sum: 1 } } },
                        { $project: { _id: 0, categoria: '$_id', n: 1 } },
                        { $sort: { n: -1 } }
                    ],
                    porPrioridade: [
                        { $group: { _id: '$prioridade', n: { $sum: 1 } } },
                        { $project: { _id: 0, prioridade: '$_id', n: 1 } }
                    ],
                    porPublicoAlvo: [
                        { $group: { _id: '$publico_alvo', n: { $sum: 1 } } },
                        { $project: { _id: 0, publico_alvo: '$_id', n: 1 } }
                    ],
                    leadTimes: [
                        { $match: { status: 'concluida', data_conclusao: { $ne: null } } },
                        {
                            $project: {
                                dias: {
                                    $divide: [
                                        { $subtract: ['$data_conclusao', '$data_criacao'] },
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            }
                        },
                        { $group: { _id: null, media: { $avg: '$dias' } } }
                    ],
                    top5AndamentoAntigas: [
                        { $match: { status: 'andamento' } },
                        { $sort: { data_criacao: 1 } },
                        { $limit: 5 },
                        {
                            $project: {
                                titulo: 1, categoria: 1, prioridade: 1,
                                responsavel: 1, data_criacao: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const total = agg.total[0]?.n || 0;
        const concluidas = agg.porStatus.find(s => s.status === 'concluida')?.n || 0;
        const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 1000) / 10 : 0;
        const leadTimeMedioDias = agg.leadTimes[0]?.media
            ? Math.round(agg.leadTimes[0].media * 10) / 10
            : 0;

        res.json({
            total,
            taxaConclusao,
            leadTimeMedioDias,
            porStatus: agg.porStatus,
            porCategoria: agg.porCategoria,
            porPrioridade: agg.porPrioridade,
            porPublicoAlvo: agg.porPublicoAlvo,
            top5AndamentoAntigas: agg.top5AndamentoAntigas
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao calcular métricas.' });
    }
};
