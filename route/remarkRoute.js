const express = require('express');
const auth = require('../Middleware/authorization');
const {
    addRemark,
    getAllRemark,
    getSingleRemark,
    updateRemark,
    getRemarksByVisit
} = require('../controllers/remarkController');

const router = express.Router();

// Remark Routes
router.post('/create', auth, addRemark); // Add a remark
router.get('/getAll', auth, getAllRemark); // Get remarks (paginated and non-paginated)
router.get('/getSingle', auth, getSingleRemark); // Get a single remark
router.post('/update', auth, updateRemark) 
router.get('/getVisitRemark', auth, getRemarksByVisit);

module.exports = router