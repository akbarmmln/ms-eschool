const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getClassRoom);
router.get('/list/:page/:search', auth.verifyToken, controller.getClassRoom);

module.exports = router;