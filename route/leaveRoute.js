const express = require("express");
const auth = require("../Middleware/authorization");
const router = express.Router();

const {
  createLeave,
  getLeaves,
  getSingleLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
} = require("../controllers/leaveController");

// Create a new leave request
router.post("/create", auth, createLeave);

// Get all leave requests (with or without pagination)
router.get("/getAll", auth, getLeaves);

// Get a single leave request by ID
router.get("/get", auth, getSingleLeave);

// Update a leave request
router.post("/update", auth, updateLeave);

// Delete a leave request
router.post("/delete", auth, deleteLeave);

// Approve or reject a leave request (Admins only)
router.post("/approve", auth, approveLeave);

module.exports = router;
