require('dotenv').config()
const express = require('express');
const path = require('path');
const open = require('open');
const connectDB = require('./config/db');


const app = express();
const PORT = 5000;

// 1. Middleware para ler JSON (Obrigatório para o req.body funcionar)
app.use(express.json());

// 2. Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// 3. AS ROTAS DA API (Devem vir ANTES do catch-all do HTML)
// Se você já criou os arquivos de rota, importe-os aqui:
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// 4. Fallback para o Frontend (Catch-all)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

connectDB();

app.listen(PORT, async () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    try {
        await open(`http://localhost:${PORT}`);
    } catch (err) {
        console.log('🌐 Acesse manualmente: http://localhost:5000');
    }
});