const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // O Mongoose gerencia o pool de conexão automaticamente
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 MongoDB Conectado com sucesso');
    } catch (err) {
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); // Para o servidor em caso de falha crítica
    }
};

module.exports = connectDB;