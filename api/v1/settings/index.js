const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/', auth.verifyToken, controller.getSetings);
router.post('/send-mail', controller.sendMail);

router.get('/alamat/kodepos/:kodepos', controller.alamatKodepos);

module.exports = router;