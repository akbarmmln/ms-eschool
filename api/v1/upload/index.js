const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../auth/controller');

router.get('/list/bucket', auth.verifyToken, controller.getListBucket);
router.post('/file-single', auth.verifyToken, controller.uploadFileSingle);

module.exports = router;