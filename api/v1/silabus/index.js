const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', controller.getSilabus);
router.get('/list/:page/:search', controller.getSilabus);

router.post('/create', auth.verifyToken, controller.createSilabus);

module.exports = router;