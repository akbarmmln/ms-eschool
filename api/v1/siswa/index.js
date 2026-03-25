const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getSiswa);
router.get('/list/:page/:search', auth.verifyToken, controller.getSiswa);

router.post('/create', auth.verifyToken, controller.createSiswa);
router.post('/update', auth.verifyToken, controller.updateSiswa);
router.get('/detail/:id', auth.verifyToken, controller.searchSiswa);

router.post('/absensi', auth.verifyToken, controller.getAbsensi);

module.exports = router;