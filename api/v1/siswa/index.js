const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getSiswa);
router.get('/list/:page/:search', auth.verifyToken, controller.getSiswa);

router.post('/create', auth.verifyToken, controller.createSiswa);
router.get('/detail/:id', controller.searchSiswa);

module.exports = router;