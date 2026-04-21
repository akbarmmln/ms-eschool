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
router.post('/ortu/remove-access', auth.verifyToken, controller.ortuRemoveAccess);
router.post('/ortu/add-access', auth.verifyToken, controller.ortuAddAccess);
router.post('/ortu/reset-access', auth.verifyToken, controller.ortuResetAccess);
router.post('/ortu/unlink', auth.verifyToken, controller.unlink);

router.post('/jurnal/:page', auth.verifyToken, controller.siswaJurnal);
router.get('/jurnal/detail/:idjurnal/:idsiswa', auth.verifyToken, controller.siswaJurnalDetail);

router.post('/upload', auth.verifyToken, controller.upload);

module.exports = router;