require('dotenv').config();
const express = require('express');
const path = require('path');
const open = require('open');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Arquivos estáticos do front-end (SPA + datasets CSV)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API (espelham o contrato da aula §"Endpoints da API")
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/metrics', require('./routes/metricsRoutes'));

// Fallback SPA (catch-all)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

connectDB();

app.listen(PORT, async () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    try {
        await open(`http://localhost:${PORT}`);
    } catch {
        console.log(`🌐 Acesse manualmente: http://localhost:${PORT}`);
    }
});
