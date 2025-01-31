const express = require("express");
const route = express.Router();
const  auth  = require("../Middleware/authorization");
 const { searchModels } = require("../controllers/searchController");
  
   
route.post("/data", auth, searchModels)
 

module.exports = route
