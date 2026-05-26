const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const taskController = require('../controllers/taskController');

// Todas as rotas de tarefas exigem autenticação JWT
router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.getTasks);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
