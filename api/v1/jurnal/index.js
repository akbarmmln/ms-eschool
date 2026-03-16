const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getListJurnal);
router.get('/list/:page/:dari/:sampai', auth.verifyToken, controller.getListJurnal);

router.post('/create', auth.verifyToken, controller.createJurnalMengajar);
router.post('/update-absensi', auth.verifyToken, controller.updateAbsensi);
router.get('/detail/:id', auth.verifyToken, controller.getDetailJurnalMengajar);
router.post('/inisiasi-penilaian', auth.verifyToken, controller.inisiasiPenilaian);
router.post('/update-penilaian', auth.verifyToken, controller.updatePenilaian);

module.exports = router;