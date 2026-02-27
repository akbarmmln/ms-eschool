const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/list/:page', controller.getClassRoom);
router.post('/create', controller.createClassRoom);

module.exports = router;