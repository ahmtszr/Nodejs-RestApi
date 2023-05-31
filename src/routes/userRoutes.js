// Modules import
const express = require('express')
const userController = require('../controller/userController')
const {signup, login, logout} = userController
const router = express.Router()

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router