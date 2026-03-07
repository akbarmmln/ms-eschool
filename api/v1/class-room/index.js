const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getClassRoom);
router.get('/list/:page/:search', auth.verifyToken, controller.getClassRoom);
router.post('/create', auth.verifyToken, controller.createClassRoom);
router.post('/update', auth.verifyToken, controller.updateClassRoom);
router.post('/delete', auth.verifyToken, controller.deleteClassRoom);

router.get('/search/:search', auth.verifyToken, controller.searchClassRoom);
router.get('/detail/:id', auth.verifyToken, controller.detailClassRoom);

module.exports = router;