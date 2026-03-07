const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getClassLevel);
router.get('/list/:page/:search', auth.verifyToken, controller.getClassLevel);
router.post('/create', auth.verifyToken, controller.createClassLevel);
router.post('/delete', auth.verifyToken, controller.deleteClassLevel);
router.post('/update', auth.verifyToken, controller.updateClassLevel);

router.get('/level', auth.verifyToken, controller.getLevelClass);
router.get('/detail/:id', auth.verifyToken, controller.getDetailLevelClass);

module.exports = router;