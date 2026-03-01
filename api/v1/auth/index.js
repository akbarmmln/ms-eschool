const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/login', controller.login);
router.post('/verify-token', controller.verifyToken);

router.post('/access', controller.access);

module.exports = router;