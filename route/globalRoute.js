const express = require("express");
const route = express.Router();
const  auth  = require("../Middleware/authorization");
 const {deleteAll} = require("../controllers/deleteController");
   
route.post("/all", auth, deleteAll)
  
  

module.exports = route
