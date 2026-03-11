const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.post('/create', auth.verifyToken, controller.createJurnalMengajar);

module.exports = router;