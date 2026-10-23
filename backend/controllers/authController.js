const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function emitirToken(user, res) {
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Erro ao emitir token.' });
        }
        res.status(201).json({ token, user: { nome: user.nome, email: user.email } });
    });
}

exports.register = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Informe nome, e-mail e senha.' });
    }
    if (senha.length < 6) {
        return res.status(400).json({ msg: 'A senha precisa ter no mínimo 6 caracteres.' });
    }

    try {
        const existente = await User.findOne({ email: email.toLowerCase().trim() });
        if (existente) return res.status(400).json({ msg: 'Este e-mail já está cadastrado.' });

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const user = await User.create({ nome, email, senhaHash });
        emitirToken(user, res);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor ao registrar.' });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ msg: 'Informe e-mail e senha.' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(400).json({ msg: 'E-mail ou senha incorretos.' });

        const confere = await bcrypt.compare(senha, user.senhaHash);
        if (!confere) return res.status(400).json({ msg: 'E-mail ou senha incorretos.' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: 'Erro ao emitir token.' });
            }
            res.json({ token, user: { nome: user.nome, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor ao fazer login.' });
    }
};
