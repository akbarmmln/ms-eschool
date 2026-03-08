const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getSilabus);
router.get('/list/:page/:search', auth.verifyToken, controller.getSilabus);

router.post('/create', auth.verifyToken, controller.createSilabus);
router.post('/update', auth.verifyToken, controller.updateSilabus);
router.get('/detail/:id', auth.verifyToken, controller.detailSilabus);

router.post('/delete/', auth.verifyToken, controller.deleteSilabus);

router.get('/relasi/:id', controller.getSilabusRelasi);

module.exports = router;