const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/:page', auth.verifyToken, controller.getTeacherList);
router.get('/list/:page/:search', auth.verifyToken, controller.getTeacherList);

router.get('/search/:search', auth.verifyToken, controller.searchTeacher);
router.post('/create', auth.verifyToken, controller.createTeacher);

router.get('/detail/:id', auth.verifyToken, controller.detailTeacher);
router.post('/update', auth.verifyToken, controller.updateTeacher);

router.post('/delete', auth.verifyToken, controller.deleteTeacher);

module.exports = router;