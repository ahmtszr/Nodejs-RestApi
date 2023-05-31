// Modules import
const express = require('express')
const router = express.Router()
const productController = require('../controller/productController')
const userController = require('../controller/userController')
const {authenticateToken} = require("../middleware/auth");
const {login} = userController
const {getAllProducts, getProductById, createProduct, updateProduct, deleteProduct} = productController

router.get('/products', getAllProducts, login);
router.get('/products/:id', authenticateToken, getProductById, login);
router.post('/products', createProduct, authenticateToken, login);
router.post('/products/:id', updateProduct, authenticateToken, login);
router.delete('/products/:id', deleteProduct, authenticateToken, login);

module.exports = router