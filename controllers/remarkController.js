const { Remark, Visit } = require('../model/visitModel');
const { User } = require('../model/userModel');
const moment = require('moment')

function formatDate(date) {
  return moment(date).format('DD-MM-YYYY');
}
const getAllRemark = async (req, res) => {
    try {
      const { roles, _id: userId } = req.user; // Extract roles and user ID from authenticated user
      const { page, pageSize } = req.query; // Extract query parameters for pagination
  console.log(req.user)
      let query = {};
  
      // Role-based query construction
      if (roles === "Admin" || roles === "HR") {
        query = {}; // Admin and HR can view all remarks
      }  else if (roles === "Manager") {       
          // Manager-specific query: fetch visits created by the manager or assigned to employees      
           const employeesUnderManager = await User.find({ as: _id }).select("_id").lean();      
            // console.log(employeesUnderManager)       
            const employeeIds = employeesUnderManager.map((emp) => emp._id);       
             query = { $or: [{ createdBy: _id }, { assignedTo: { $in: employeeIds } }],       };     
            } else if (roles === "Employee") {      
               // Employee-specific query      
                query = { $or: [{ createdBy: _id }, { assignedTo: _id }] };     
               
        } else {
        return res.status(403).json({ message: "Access denied: Unauthorized role." });
      }
  
      let remarks, totalRemarks, totalPages;
  
      if (!page || !pageSize) {
        // Non-paginated response
        remarks = await Remark.find(query)
          .populate({
            path: "visitId",
            select: "visitDate visitTime visitDoctor assignedTo",
            populate: [
              { path: "visitDoctor", select: "name email roles visitFrequency" },
              { path: "assignedTo", select: "name email roles visitFrequency" },
            ],
          })
          .populate("createdBy", "name email roles area image")
          .sort({ createdAt: -1 })
          .lean();
  
        totalRemarks = remarks.length;
        totalPages = 1;
      } else {
        // Paginated response
        const skip = (parseInt(page) - 1) * parseInt(pageSize);
  
        remarks = await Remark.find(query)
          .populate({
            path: "visitId",
            select: "visitDate visitTime visitDoctor assignedTo",
            populate: [
              { path: "visitDoctor", select: "name email roles visitFrequency" },
              { path: "assignedTo", select: "name email roles visitFrequency" },
            ],
          })
          .populate("createdBy", "name email roles area image")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(pageSize))
          .lean();
  
        totalRemarks = await Remark.countDocuments(query);
        totalPages = Math.ceil(totalRemarks / parseInt(pageSize));
      }
  
      // Prepare the response object
      const response = {
        message: "Remarks fetched successfully.",
        data: remarks,
        summary: {
          totalRemarks,
          totalPages,
          currentPage: page ? parseInt(page) : 1,
          perPage: pageSize ? parseInt(pageSize) : totalRemarks,
          pagination: Boolean(page && pageSize),
        },
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching remarks:", error.message);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  };
  
  
  const addRemark = async (req, res) => {
    try {
      const { roles, _id: userId } = req.user; // Extract user role and ID
      const { visitId, remarkText, remarkDate, remarkTime } = req.body; // Extract visit ID and remark data
  
      // Validate the visit
      const visitExists = await Visit.findById(visitId).populate("assignedTo", "roles");
      if (!visitExists) {
        return res.status(404).json({ message: "Visit not found." });
      }
  
      // Role-based permission checks
   if (!["HR", "Admin","Manager","Employee"].includes(roles)) {
        // Only Admin and HR can bypass all other checks
        return res.status(403).json({ message: "You are not authorized to add remarks." });
      }
  
      // Always add a new remark, even if one exists
      const newRemark = new Remark({
        visitId,
        remarkText,
        remarkDate ,
        remarkTime,
        createdBy: userId, // Set the creator of the remark
      });
  
      await newRemark.save();
  
      // Update the visit with the new remark ID
      await Visit.findByIdAndUpdate(visitId, { $push: { remark: newRemark._id } });
  
      res.status(200).json({ message: "Remark added successfully!", remark: newRemark });
    } catch (error) {
      console.error("Error adding remark:", error.message);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  };
  
  
  
  
  
  
  
  
  const getRemarksByVisit = async (req, res) => {
    try {
      const { visitId } = req.query;
      if (!visitId) {
        return res.status(400).json({ message: "Visit ID is required." });
      }
  
      const remarks = await Remark.find({ visit: visitId })
        .populate("createdBy", "name email roles")
        .populate({
          path: "visitId",
          select: "visitDate visitTime visitDoctor assignedTo",
          populate: [
            { path: "visitDoctor", select: "name email roles visitFrequency" },
            { path: "assignedTo", select: "name email roles visitFrequency" },
          ],
        });
  
      res.status(200).json({ message: "Remarks fetched successfully.", data: remarks });
    } catch (error) {
      console.error("Error fetching remarks:", error.message);
      res.status(500).json({ error: "Internal server error while fetching remarks." });
    }
  };
  
  
  

// Get a single remark
const getSingleRemark = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Remark ID is required.' });
    }

    const remark = await Remark.findById(id)
      .populate('createdBy', 'name email roles')
      .populate('visit');

    if (!remark) {
      return res.status(404).json({ message: 'Remark not found.' });
    }

    res.status(200).json({ message: 'Remark fetched successfully', remark });
  } catch (error) {
    console.error('Error fetching remark:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching remark.' });
  }
};


const updateRemark = async (req, res) => {
    try {
      const { roles, id: userId } = req.user; // Extract user details from auth middleware
      const { _id, ...updateFields } = req.body; // Extract remark ID and update fields
  
      if (!_id) {
        return res.status(400).json({ message: "Remark ID (_id) is required." });
      }
  
      // Fetch the remark to be updated
      const remark = await Remark.findById(_id);
  
      if (!remark) {
        return res.status(404).json({ message: "Remark not found." });
      }
  
      // Role-based access control
      // if (roles === "Employee") {
      //   return res.status(403).json({ message: "Employees are not authorized to update remarks." });
      // }
  
      if (roles === "Manager" && remark.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "Managers can only update their own remarks." });
      }
  
      // Update the remark
      const updatedRemark = await Remark.findByIdAndUpdate(
        _id,
        { ...updateFields, updatedAt: new Date() }, // Automatically update the `updatedAt` field
        { new: true }
      );
  
      res.status(200).json({
        message: "Remark updated successfully.",
        updatedRemark,
      });
    } catch (error) {
      console.error("Error updating remark:", error.message);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  };

  
module.exports = { 
  addRemark,
  getAllRemark,
  getSingleRemark,
  updateRemark,
  getRemarksByVisit
};















