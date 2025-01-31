const express = require('express');
const auth = require('../Middleware/authorization');
const {
  createVisit,
  getVisits,
  getSingleVisit,
  updateVisit,
 
} = require('../controllers/visitController');

const router = express.Router();

// Visit Routes
router.post('/create', auth, createVisit);  
router.get('/getAll', auth, getVisits);  
router.get('/get', auth, getSingleVisit);  
 router.post('/update', auth, updateVisit);


module.exports = router;
