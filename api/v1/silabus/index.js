const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.post('/create', controller.createSilabus);

module.exports = router;