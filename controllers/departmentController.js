

const Department = require("../model/departmentModel");

// Create a new department
const postDepartment = async (req, res) => {
  try {
    const newDepartment = new Department(req.body);
    await newDepartment.save();
    console.log("Department Created:", newDepartment);
    res.status(201).json({
      message: "Department created successfully.",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error.message);
    res.status(500).json({ error: "Failed to create department. Please try again later." });
  }
};

// Get all departments with or without pagination
const getDepartment = async (req, res) => {
  try {
    const { page, limit } = req.query; // Extract pagination parameters

    if (!page || !limit) {
      // If pagination parameters are not provided, return all data
      const departments = await Department.find().sort({ _id: -1 }); // Sort by creation date descending
      return res.status(200).json({
        message: "Departments retrieved successfully.",
        data: departments,
        totalDepartments: departments.length, // Total count of all departments
        pagination: false, // Indicate that pagination is not applied
      });
    }

    // If pagination parameters are provided, return paginated data
    const skip = (parseInt(page) - 1) * parseInt(limit); // Calculate documents to skip

    const departments = await Department.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalDepartments = await Department.countDocuments(); // Total count of all departments

    res.status(200).json({
      message: "Departments retrieved successfully with pagination.",
      data: departments,
      totalDepartments,
      totalPages: Math.ceil(totalDepartments / limit), // Calculate total pages
      currentPage: parseInt(page), // Current page
      perPage: parseInt(limit), // Items per page
      pagination: true, // Indicate that pagination is applied
    });
  } catch (error) {
    console.error("Error fetching departments:", error.message);
    res.status(500).json({ error: "Failed to fetch departments. Please try again later." });
  }
};

// Get a single department by ID
const getSingleDepartment = async (req, res) => {
  try {
    const { id } = req.query; // Extract the department ID from request  

    if (!id) {
      return res.status(400).json({ error: "Department ID is required." });
    }

    const department = await Department.findById(id)
      // .populate("departments", "name") // Populate related fields if necessary
      .lean();  

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.status(200).json({
      message: "Department retrieved successfully.",
      department,
    });
  } catch (error) {
    console.error("Error fetching department:", error.message);
    res.status(500).json({ error: "Failed to fetch department. Please try again later." });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Department ID is required for update." });
    }

    const departmentUpdate = await Department.findByIdAndUpdate(_id, updateData, { new: true });
    if (!departmentUpdate) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.status(200).json({
      message: "Department updated successfully.",
      department: departmentUpdate,
    });
  } catch (error) {
    console.error("Error updating department:", error.message);
    res.status(500).json({ error: "Failed to update department. Please try again later." });
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Department ID is required for deletion." });
    }

    const department = await Department.findByIdAndDelete(_id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.status(200).json({
      message: "Department deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting department:", error.message);
    res.status(500).json({ error: "Failed to delete department. Please try again later." });
  }
};

module.exports = {
  postDepartment,
  getDepartment,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
};
