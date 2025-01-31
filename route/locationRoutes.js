const express = require("express");
const router = express.Router();
const {
    createOrUpdateLocation,
    getAllLocations,
    getLocationByUserId,
    deleteLocation
} = require("../controllers/locationController");
const auth = require("../Middleware/authorization"); // Middleware for authorization

// Route 1: Create or Update User Location
router.post("/create", auth, createOrUpdateLocation);

// Route 2: Get All User Locations
router.get("/getall", auth, getAllLocations);

// Route 3: Get Single User Location
router.get("/get", auth, getLocationByUserId);

// Route 4: Delete User Location
router.post("/delete", auth, deleteLocation);

module.exports = router;
