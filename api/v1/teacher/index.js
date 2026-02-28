const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/list/:page', controller.getTeacherList);
router.get('/list/:page/:search', controller.getTeacherList);

router.get('/search/:search', controller.searchTeacher);
router.post('/create', controller.createTeacher);

router.get('/detail/:id', controller.detailTeacher);

module.exports = router;