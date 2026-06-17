const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/', auth.verifyToken, controller.getSetings);
router.post('/send-mail', controller.sendMail);

router.get('/alamat/kodepos/:kodepos', controller.alamatKodepos);
router.post('/update/lembaga', auth.verifyToken, controller.updateLembaga);
router.post('/situs-upload/images', auth.verifyToken, controller.uploadImagesSitus);

module.exports = router;