const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) return res.status(401).json({ msg: 'Sem token, acesso negado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Adiciona o ID do usuário à requisição
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};