const express = require("express");
const auth = require("../Middleware/authorization");
const router = express.Router();
const { 
  postDepartment, 
  getDepartment, 
  getSingleDepartment, 
  updateDepartment, 
  deleteDepartment 
} = require("../controllers/departmentController");

router.get("/test", (req, res) => {
  return res.send("Welcome to common user department route 💁");
});

// Create a new department
router.post("/create", auth, postDepartment);

// Get all departments with or without pagination
router.get("/getAll", auth, getDepartment);

// Get a single department by ID
router.get("/get", auth, getSingleDepartment);

// Update a department
router.post("/update", auth, updateDepartment);

// Delete a department
router.post("/delete", auth, deleteDepartment);

module.exports = router;
