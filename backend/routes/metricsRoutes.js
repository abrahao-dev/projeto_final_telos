const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const metricsController = require('../controllers/metricsController');

router.get('/', auth, metricsController.getMetrics);

module.exports = router;
