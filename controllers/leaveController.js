const Leaves = require("../model/leaveModel");
const {User} = require("../model/userModel");

// Create a new leave request
const createLeave = async (req, res) => {
  try {
    const newLeave = new Leaves({
      ...req.body,
      name: req.user._id, // Associate leave with the logged-in user
      status: "Pending",
    });

    await newLeave.save();

    // Link leave to the user's document
    await User.findByIdAndUpdate(req.user._id, { $push: { leaves: newLeave._id } });

    res.status(201).json({
      message: "Leave request created successfully.",
      leave: newLeave,
    });
  } catch (error) {
    console.error("Error creating leave:", error.message);
    res.status(500).json({ error: "Internal server error while creating leave." });
  }
};

// Get all leave requests (with pagination and summary)
const getLeaves = async (req, res) => {
    try {
      const { roles, _id: userId } = req.user; // Extract user details from auth middleware
      const { page, limit } = req.query; // Pagination parameters
  
      // Define query based on role
      let query = roles === "Employee" ? { name: userId } : {}; // Employees can only view their own leaves
  
      // If pagination parameters are not provided, fetch all records
      if (!page || !limit) {
        const leaves = await Leaves.find(query)
          .populate("name", "name email")
          .populate("approvedBy", "name email")
          .sort({ createdAt: -1 });
  
        const totalLeaves = leaves.length;
  
        return res.status(200).json({
          message: "All leaves fetched successfully.",
          leaves,
          summary: {
            totalRecords: totalLeaves,
            pagination: false, // Indicate that pagination is not applied
          },
        });
      }
  
      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const totalLeaves = await Leaves.countDocuments(query); // Total count of leave requests
      const leaves = await Leaves.find(query)
        .populate("name", "name email")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
  
      res.status(200).json({
        message: "Leaves fetched successfully.",
        leaves,
        summary: {
          totalRecords: totalLeaves,
          totalPages: Math.ceil(totalLeaves / parseInt(limit)),
          currentPage: parseInt(page),
          perPage: parseInt(limit),
          pagination: true, // Indicate that pagination is applied
        },
      });
    } catch (error) {
      console.error("Error fetching leaves:", error.message);
      res.status(500).json({ error: "Internal server error while fetching leaves." });
    }
  };
  

// Get a single leave request by ID
const getSingleLeave = async (req, res) => {
  try {
    const { _id } = req.query;

    const leave = await Leaves.findById(_id)
      .populate("name", "name email")
      .populate("approvedBy", "name email");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    res.status(200).json({
      message: "Leave fetched successfully.",
      leave,
    });
  } catch (error) {
    console.error("Error fetching leave:", error.message);
    res.status(500).json({ error: "Internal server error while fetching leave." });
  }
};

// Update a leave request
const updateLeave = async (req, res) => {
  try {
    const { _id } = req.body;

    const leave = await Leaves.findById(_id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

   

    const updatedLeave = await Leaves.findByIdAndUpdate(_id, req.body, { new: true });
    res.status(200).json({
      message: "Leave updated successfully.",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error("Error updating leave:", error.message);
    res.status(500).json({ error: "Internal server error while updating leave." });
  }
}

// Delete leave request(s)
const deleteLeave = async (req, res) => {
    try {
      const { _id } = req.body; // Accept either a single ID or an array of IDs
  
      if (!_id || (_id instanceof Array && _id.length === 0)) {
        return res.status(400).json({ message: "No leave ID(s) provided for deletion." });
      }
  
      const ids = Array.isArray(_id) ? _id : [_id]; // Ensure IDs are in an array
  
      // Fetch the leave requests to validate permissions
      const leaves = await Leaves.find({ _id: { $in: ids } });
  
      if (leaves.length === 0) {
        return res.status(404).json({ message: "No matching leave requests found." });
      }
  
      
  
      // Delete the leave requests
      const result = await Leaves.deleteMany({ _id: { $in: ids } });
  
      res.status(200).json({
        message: `${result.deletedCount} leave request(s) deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting leave(s):", error.message);
      res.status(500).json({ error: "Internal server error while deleting leave(s)." });
    }
  };
  

// Approve or reject a leave request
const approveLeave = async (req, res) => {
  try {
    const { _id, status, approveReason } = req.body;
console.log(req.body)
    // Ensure the reason is provided
    if (!approveReason || approveReason.trim() === "") {
      return res.status(400).json({ message: "Reason is required when approving or rejecting a leave." });
    }

    // Ensure the status is valid
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Status must be 'Approved' or 'Rejected'." });
    }

    // Fetch the leave to determine the requester's role
    const leave = await Leaves.findById(_id).populate("name", "roles"); // Fetch the leave and user's role
    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    const approverRole = req.user.roles; // Role of the current approver (HR, Manager, or Admin)
    const requesterRole = leave.name.roles; // Role of the user who requested the leave

    // Role-based approval logic
    if (approverRole === "HR" || approverRole === "Manager") {
      // HR and Manager can only approve/reject leaves for Employees
      if (requesterRole !== "Employee") {
        return res.status(403).json({ message: "Unauthorized: HR or Manager can approve only Employee leaves." });
      }
    } else if (approverRole === "Admin") {
      // Admin can approve/reject all leave requests
      // No restrictions required for Admin
    } else {
      // Other roles are not authorized to approve/reject leaves
      return res.status(403).json({ message: "Unauthorized: You are not allowed to approve or reject leaves." });
    }

    // Update the leave status
    const updatedLeave = await Leaves.findByIdAndUpdate(
      _id,
      { status, approvedBy: req.user.id,   approveReason, updatedAt: new Date() },
      { new: true }
    );

    res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully.`,
      leave: updatedLeave,
    });
  } catch (error) {
    console.error("Error approving leave:", error.message);
    res.status(500).json({ error: "Internal server error while approving leave." });
  }
};


module.exports = {
  createLeave,
  getLeaves,
  getSingleLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
};
