const mongoose = require('mongoose');

// Define the schema for storing latitude and longitude
const locationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, // Reference to the User model
      ref: 'User', 
      required: true // Ensures userId is mandatory
    },
    longitude: { 
      type: String, 
      required: true // Ensure longitude is mandatory 
    },
    latitude: { 
      type: String, 
      required: true // Ensure latitude is mandatory
    }
  },
  { 
    timestamps: true // Automatically manage createdAt and updatedAt fields
  }
);

// Create the Location model
const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
