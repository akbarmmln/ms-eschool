const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getClassLevel);
router.get('/list/:page/:search', auth.verifyToken, controller.getClassLevel);

module.exports = router;