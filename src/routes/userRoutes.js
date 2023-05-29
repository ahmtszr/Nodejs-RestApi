// Modülleri import edelim
const express = require('express')
const userController = require('../controller/userController')
const { signup, login, logout} = userController

const router = express.Router()

//Signup endpoint
router.post('/signup', signup)

//Login route
router.post('/login',login)

//Logout endpoint
router.post('/logout', logout)



module.exports = router