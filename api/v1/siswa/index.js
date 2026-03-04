const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', controller.getSiswa);
router.get('/list/:page/:search', controller.getSiswa);


module.exports = router;