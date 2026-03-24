const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/', auth.verifyToken, controller.profile);
router.post('/ds1/update-personal', auth.verifyToken, controller.updatePersonal);
router.post('/change/password', auth.verifyToken, controller.ubahPassword);

module.exports = router;