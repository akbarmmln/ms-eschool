const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/list/:page', controller.getClassRoom);
router.get('/list/:page/:search', controller.getClassRoom);
router.post('/create', controller.createClassRoom);
router.post('/update', controller.updateClassRoom);
router.post('/delete', controller.deleteClassRoom);

module.exports = router;