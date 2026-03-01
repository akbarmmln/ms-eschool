const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getClassRoom);
router.get('/list/:page/:search', auth.verifyToken, controller.getClassRoom);
router.post('/create', auth.verifyToken, controller.createClassRoom);
router.post('/update', auth.verifyToken, controller.updateClassRoom);
router.post('/delete', auth.verifyToken, controller.deleteClassRoom);

module.exports = router;