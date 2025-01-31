const express = require("express")
const router = express.Router()

const auth = require("../Middleware/authorization");
// const Location = require("../model/laglatModel");
const { getIP ,
  getAllLocations,
  getLocationByUserId,
 
} = require("../controllers/locationController");



// router.get('/get-location', auth , getIP);
router.post('/get-location', auth , getIP);

router.get("/getAll", auth, getAllLocations);

 router.get("/get", auth, getLocationByUserId);

 
module.exports = router

 