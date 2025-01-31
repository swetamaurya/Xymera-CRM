const Location = require("../model/laglatModel");
const axios = require("axios");
const { User } = require("../model/userModel");
 
 
// Create User Location
exports.getIP = async (req, res) => {
    try {
        const { latitude, longitude,userId } = req.body;
        // console.log("Incoming Location Data:", req.body);

        if (!latitude || !longitude || !userId) {
            return res.status(400).json({ success: false, message: "Latitude, longitude, and userId are required." });
        }

        // Fetch address using reverse geocoding
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const geoResponse = await axios.get(geoUrl);
        const address = geoResponse.data?.display_name || "Address not available";

        // Save or update location
        const location = await Location.findOneAndUpdate(
            { userId },
            { latitude, longitude, address, userId, updatedAt: new Date()  },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Fetch user details with image
        const user = await User.findById(userId, "name image");

        res.status(200).json({
            success: true,
            message: "Location saved successfully!",
            location: {
                userId: userId,
                name: user?.name || "Unknown",
                image: user?.image || null, // Include user image
                latitude: latitude,
                longitude: longitude,
                address: address
            }
        });
    } catch (error) {
        console.error("Error saving location:", error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

 
// Get All User Locations
exports.getAllLocations = async (req, res) => {
    try {
        const users = await User.find({}, "_id name image");
        const locations = [];

        for (const user of users) {
            const location = await Location.findOne({ userId: user._id }).sort({ createdAt: -1 }).lean();
            if (location) {
                locations.push({
                    userId: user._id,
                    name: user.name,
                    image: user.image || null, // Include user image
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: location.address
                });
            }
        }

        res.status(200).json({ success: true, locations });
    } catch (error) {
        console.error("Error fetching all locations:", error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

   
// Get Single User Location
exports.getLocationByUserId = async (req, res) => {
    try {
        const { userId } = req.query;
        const location = await Location.findOne({ userId }).populate("userId", "name image");

        if (!location) {
            return res.status(404).json({ success: false, message: "Location not found for this user." });
        }

        res.status(200).json({
            success: true,
            location: {
                userId: location.userId?._id,
                name: location.userId?.name,
                image: location.userId?.image || null, // Include user image
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address
            }
        });
    } catch (error) {
        console.error("Error fetching single user location:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};




 