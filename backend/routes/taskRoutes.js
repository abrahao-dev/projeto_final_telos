const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const taskController = require('../controllers/taskController');

router.get('/', auth, taskController.getTasks);
router.get('/:id', auth, taskController.getTaskById);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
