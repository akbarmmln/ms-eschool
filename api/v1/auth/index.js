const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/login', controller.login);
router.post('/invalidate-forgot-password', controller.invForPass);
router.get('/invalidate-page/:jwt', controller.invalPage);
router.post('/verify-token', controller.verifyToken);

router.post('/access', controller.access);
router.post('/verify-otp', controller.verifyOTP);

module.exports = router;