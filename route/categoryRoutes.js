const express = require('express');
const router = express.Router();

const { createCategory, getAllCategories,getSingleCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const auth = require('../Middleware/authorization');

router.post('/create',auth, createCategory);
router.get('/getAll',auth, getAllCategories);
router.get('/get',auth, getSingleCategory);
router.post('/update',auth, updateCategory);
// router.post('/delete', deleteCategory);

module.exports = router;
