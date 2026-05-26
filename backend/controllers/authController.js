const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRO DE USUÁRIO ---
exports.register = async (req, res) => {
    const { name, email, pass } = req.body; // 'pass' vem do seu HTML

    try {
        // 1. Verificar se o usuário já existe
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Este e-mail já está cadastrado.' });

        // 2. Criar instância do novo usuário
        user = new User({ name, email, password: pass });

        // 3. Criptografar a senha (Salt & Hash)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(pass, salt);

        // 4. Salvar no MongoDB
        await user.save();
        // 5. Gerar o Token JWT
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, email: user.email } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor ao registrar.');
    }
};

// --- LOGIN DE USUÁRIO ---
exports.login = async (req, res) => {
    const { email, pass } = req.body;

    try {
        // 1. Procurar o usuário pelo e-mail
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'E-mail ou senha incorretos.' });

        // 2. Comparar a senha digitada com a senha criptografada no banco
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'E-mail ou senha incorretos.' });

        // 3. Se tudo OK, gerar novo Token
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, email: user.email } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor ao fazer login.');
    }
};