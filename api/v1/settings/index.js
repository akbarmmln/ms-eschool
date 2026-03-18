const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/', auth.verifyToken, controller.getSetings);

module.exports = router;