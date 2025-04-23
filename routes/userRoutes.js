const express = require('express');
const { register, login, getMe } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { cacheMiddleware, clearCache } = require('../middlewares/apicache');

const router = express.Router();

router.post('/register', clearCache, register);
router.post('/login', login);
router.get('/me', protect, cacheMiddleware(), getMe);

module.exports = router;
