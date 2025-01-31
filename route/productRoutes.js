const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts,getSingleProduct, updateProduct, deleteProduct } = require('../controllers/productcontroller');
const auth = require('../Middleware/authorization');
 
router.post('/create', auth, createProduct);
router.get('/getAll',auth, getAllProducts);
router.get('/get',auth, getSingleProduct);
router.post('/update', auth,updateProduct);
// router.post('/delete', deleteProduct);

module.exports = router;
