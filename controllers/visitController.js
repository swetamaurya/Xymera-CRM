const { User } = require('../model/userModel');
const { Visit, Remark } = require('../model/visitModel');
  const moment = require('moment')

 
  // const createVisit = async (req, res) => {
  //   try {
  //     const { roles, _id } = req.user;
  //     const {
  //       visitType,
  //       visitWorkingWith,
  //       visitDoctor,
  //       visitProduct,
  //       visitChemist,
  //       visitDate,
  //       assignedTo,
  //     } = req.body;
  
  //     // Validation
  //     if (!visitType || !["Doctor", "Chemist"].includes(visitType)) {
  //       return res
  //         .status(400)
  //         .json({ message: 'Invalid visitType. It must be either "Doctor" or "Chemist".' });
  //     }
  
  //     if (visitType === "Doctor" && (!visitDoctor || !Array.isArray(visitDoctor) || visitDoctor.length === 0)) {
  //       return res
  //         .status(400)
  //         .json({ message: "visitDoctor is required and must be an array for Doctor visits." });
  //     }
  
  //     if (visitType === "Chemist" && (!visitChemist || !Array.isArray(visitChemist) || visitChemist.length === 0)) {
  //       return res
  //         .status(400)
  //         .json({ message: "visitChemist is required and must be an array for Chemist visits." });
  //     }
      
  
  //     if (!visitDate || !moment(visitDate, ["YYYY-MM-DD", "DD-MM-YYYY"], true).isValid()) {
  //       return res.status(400).json({ message: "Invalid visitDate. Please provide a valid date." });
  //     }
  
  //     const visits = [];
  //     const formattedVisitDate = moment(visitDate, ["YYYY-MM-DD", "DD-MM-YYYY"]).format("DD-MM-YYYY");
  
  //     // Iterate over entities based on visit type
  //     const entities = visitType === "Doctor" ? visitDoctor : visitChemist;
  
  //     for (const entity of entities) {
  //       let query = {
  //         visitType,
  //         visitDoctor: visitType === "Doctor" ? entity : null,
  //         visitChemist: visitType === "Chemist" ? entity : null,
  //         visitProduct: { $size: visitProduct.length, $all: visitProduct }, // Strict match for products
  //         assignedTo: {$size: assignedTo.length, $all: assignedTo },
  //         visitWorkingWith,
  //       };
  
  //       if (roles === "Employee") {
  //         query = {
  //           ...query,
  //           assignedTo: { $all: assignedTo },
  //         };
  //       } else if (roles === "Admin" || roles === "Manager") {
  //         query = {
  //           ...query,
  //           assignedTo: { $all: assignedTo },
  //         };
  //       }
  
  //       const existingVisit = await Visit.findOne(query);
  
  //       if (existingVisit) {
  //         // Update existing visit only if frequencyStatus is "Complete"
  //         if (!existingVisit.multiDateFrequencyArray.includes(formattedVisitDate)) {
  //           existingVisit.multiDateFrequencyArray.push(formattedVisitDate);
  //           if (existingVisit.frequencyStatus === "Complete") {
  //             existingVisit.countVisitFrequency += 1;
  //             existingVisit.frequencyStatus = "In Complete"; // Reset after completion
  //           }
  //           existingVisit.visitDate = formattedVisitDate; // Update the latest visitDate
  //         }
  
  //         const updatedVisit = await existingVisit.save();
  //         visits.push(updatedVisit);
  //       } else {
  //         // Create a new visit
  //         const newVisit = new Visit({
  //           visitType,
  //           visitDoctor: visitType === "Doctor" ? entity : null,
  //           visitChemist: visitType === "Chemist" ? entity : null,
  //           visitProduct: Array.isArray(visitProduct) ? visitProduct : [visitProduct],
  //           createdBy: _id,
  //           assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo],
  //           visitWorkingWith,
  //           visitDate: formattedVisitDate,
  //           countVisitFrequency: 0, // Initialize frequency as 0
  //           frequencyStatus: "In Complete",
  //           multiDateFrequencyArray: [formattedVisitDate], // Initialize array with the first visitDate
  //         });
  
  //         const savedVisit = await newVisit.save();
  //         visits.push(savedVisit);
  //       }
  //     }
  
  //     res.status(200).json({
  //       message: `${visits.length} ${visitType} visit(s) processed successfully.`,
  //       visits,
  //     });
  //   } catch (error) {
  //     console.error("Error creating visit:", error.message);
  //     res.status(500).json({ error: `Internal server error: ${error.message}` });
  //   }
  // };
  
  
  const createVisit = async (req, res) => {
    try {
      const { roles, _id } = req.user;
      const {
        visitType,
        visitWorkingWith,
        visitDoctor,
        visitProduct,
        visitChemist,
        visitDate,
        assignedTo,
      } = req.body;
  
      // Validation
      if (!visitType || !["Doctor", "Chemist"].includes(visitType)) {
        return res
          .status(400)
          .json({ message: 'Invalid visitType. It must be either "Doctor" or "Chemist".' });
      }
  
      if (visitType === "Doctor" && (!visitDoctor || !Array.isArray(visitDoctor) || visitDoctor.length === 0)) {
        return res
          .status(400)
          .json({ message: "visitDoctor is required and must be an array for Doctor visits." });
      }
  
      if (visitType === "Chemist" && (!visitChemist || !Array.isArray(visitChemist) || visitChemist.length === 0)) {
        return res
          .status(400)
          .json({ message: "visitChemist is required and must be an array for Chemist visits." });
      }
  
      if (!visitDate || !moment(visitDate, ["YYYY-MM-DD", "DD-MM-YYYY"], true).isValid()) {
        return res.status(400).json({ message: "Invalid visitDate. Please provide a valid date." });
      }
  
      const visits = [];
      const formattedVisitDate = moment(visitDate, ["YYYY-MM-DD", "DD-MM-YYYY"]).format("DD-MM-YYYY");
  
      // Iterate over entities based on visit type
      const entities = visitType === "Doctor" ? visitDoctor : visitChemist;
  
      for (const entity of entities) {
        let query = {
          visitType,
          visitDoctor: visitType === "Doctor" ? entity : null,
          visitChemist: visitType === "Chemist" ? entity : null,
          visitProduct: { $size: visitProduct.length, $all: visitProduct }, // Strict match for products
          assignedTo: { $size: assignedTo.length, $all: assignedTo },
          visitWorkingWith,
        };
  
        if (roles === "Employee") {
          // Employee-specific logic: Match doctor, product, and assigned employees strictly
          query = {
            ...query,
            visitProduct: { $size: visitProduct.length, $all: visitProduct },
            assignedTo: { $all: assignedTo },
          };
        } else if (roles === "Manager") {
          // Manager-specific logic: Match doctor, product, and assigned employees strictly
          query = {
            ...query,
            visitProduct: { $size: visitProduct.length, $all: visitProduct },
            assignedTo: { $size: assignedTo.length, $all: assignedTo }, // Ensure strict match for assigned employees
            visitWorkingWith,
          };
        } else if (roles === "Admin") {
          // Admin-specific logic: Allow updates with strict matching
          query = {
            ...query,
            visitProduct: { $size: visitProduct.length, $all: visitProduct },
            assignedTo: { $size: assignedTo.length, $all: assignedTo }, // Ensure strict match for assigned employees
            visitWorkingWith,
          };
        }
  
        const existingVisit = await Visit.findOne(query);
  
        if (existingVisit) {
          // Update existing visit only if frequencyStatus is "Complete"
          if (!existingVisit.multiDateFrequencyArray.includes(formattedVisitDate)) {
            existingVisit.multiDateFrequencyArray.push(formattedVisitDate);
            if (existingVisit.frequencyStatus === "Complete") {
              existingVisit.countVisitFrequency += 1;
              existingVisit.frequencyStatus = "In Complete"; // Reset after completion
            }
            existingVisit.visitDate = formattedVisitDate; // Update the latest visitDate
          }
  
          const updatedVisit = await existingVisit.save();
          visits.push(updatedVisit);
        } else {
          // Create a new visit
          const newVisit = new Visit({
            visitType,
            visitDoctor: visitType === "Doctor" ? entity : null,
            visitChemist: visitType === "Chemist" ? entity : null,
            visitProduct: Array.isArray(visitProduct) ? visitProduct : [visitProduct],
            createdBy: _id,
            assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo],
            visitWorkingWith,
            visitDate: formattedVisitDate,
            countVisitFrequency: 0, // Initialize frequency as 0
            frequencyStatus: "In Complete",
            multiDateFrequencyArray: [formattedVisitDate], // Initialize array with the first visitDate
          });
  
          const savedVisit = await newVisit.save();
          visits.push(savedVisit);
        }
      }
  
      res.status(200).json({
        message: `${visits.length} ${visitType} visit(s) processed successfully.`,
        visits,
      });
    } catch (error) {
      console.error("Error creating visit:", error.message);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  };
  
  

 
const getVisits = async (req, res) => {
  try {
    const { roles, _id } = req.user; // Extract user role and ID
    // console.log(req.user)
    const { page = 1, limit = 10 } = req.query; // Pagination parameters with defaults

    // Define query based on roles
   
    let query = {};
    if (roles === "Admin" || roles === "HR" || roles === "Manager") {
      query = { };     
    }
    // else if (roles === "Manager") {       
    //   // Manager-specific query: fetch visits created by the manager or assigned to employees      
    //    const employeesUnderManager = await User.find({ createdBy: _id }).select("_id").lean();      
    //     // console.log(employeesUnderManager)       
    //     const employeeIds = employeesUnderManager.map((emp) => emp._id);       
    //     query = {
    //     $or: [
    //       { createdBy: _id }, // Visits created by manager
    //       { visitEmployee: _id }, // Visits assigned to manager
    //       {visitManager:_id},
    //       { visitManager: { $in: employeeIds } }, // Visits created by employees under manager
    //       { createdBy: { $in: employeeIds } }, // Visits created by employees under manager
    //       { visitEmployee: { $in: employeeIds } }, // Visits assigned to employees under manager
    //     ],
    //   }
    //   }  
    else if (roles === "Employee") {      
           // Employee-specific query      
            query = { $or: [{ createdBy: _id },  { assignedTo: _id }] };     
           
    } else {
      return res.status(403).json({ message: "Access denied: Unauthorized role." });
    }


    // Pagination and sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const options = {
      populate: [
        { path: "visitDoctor", select: "name email roles area visitFrequency" },
        // { path: "visitEmployee", select: "name email roles image" },
        // { path: "visitManager", select: "name email roles image" },        
        { path: "visitChemist", select: "name email roles area visitFrequency" },
        { path: "visitProduct" },
        { path: "remark", populate: { path: "createdBy", select: "name email roles image" } },
        { path: "createdBy", select: "name email roles image" },
        { path: "assignedTo", select: "name email roles image" },  
       ],
      sort: { createdAt: -1 },
    };

    // Fetch visits based on the query
    const visits = await Visit.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Count total records for pagination
    const totalRecords = await Visit.countDocuments(query);

       
    // Separate visits by visitType
    const DoctorVisitDate = {};
    const ChemistVisitDate = {};
    const DoctorCreatedDate = {};
    const ChemistCreatedDate = {};

    visits.forEach((visit) => {
      const visitType = visit.visitDoctor ? "Doctor" : visit.visitChemist ? "Chemist" : null;

      // Group by visitDate
      if (visitType === "Doctor") {
        const visitDate = visit.visitDate;
        if (!DoctorVisitDate[visitDate]) {
          DoctorVisitDate[visitDate] = [];
        }
        DoctorVisitDate[visitDate].push({
          _id: visit._id,
          visitDate: visit.visitDate,
          visitTime: visit.visitTime,
          visitDoctor: visit.visitDoctor,
          countVisitFrequency:visit.countVisitFrequency,
          frequencyStatus: visit.frequencyStatus,
          multiDateFrequencyArray: visit.multiDateFrequencyArray,
          visitWorkingWith: visit.visitWorkingWith,
          products: visit.visitProduct,
          remark:visit.remark,
          status:visit.status,
          createdBy: visit.createdBy, 
          assignedTo: visit.assignedTo,
           createdAt: visit.createdAt,
        });
      } else if (visitType === "Chemist") {
        const visitDate = visit.visitDate;
        if (!ChemistVisitDate[visitDate]) {
          ChemistVisitDate[visitDate] = [];
        }
        ChemistVisitDate[visitDate].push({
          _id: visit._id,
          visitDate: visit.visitDate,
          visitTime: visit.visitTime,
          visitChemist: visit.visitChemist,
          countVisitFrequency:visit.countVisitFrequency,
          frequencyStatus: visit.frequencyStatus,
          multiDateFrequencyArray: visit.multiDateFrequencyArray,
          visitWorkingWith: visit.visitWorkingWith,
          products: visit.visitProduct,
          remark:visit.remark,
          status:visit.status,
          createdBy: visit.createdBy, 
          assignedTo: visit.assignedTo,
           createdAt: visit.createdAt,
        });
      }

      // Group by createdDate
      const createdDate = visit.createdAt.split(" ")[0]; // Extract only the date part
      if (visitType === "Doctor") {
        if (!DoctorCreatedDate[createdDate]) {
          DoctorCreatedDate[createdDate] = [];
        }
        DoctorCreatedDate[createdDate].push({
          _id: visit._id,
          visitDate: visit.visitDate,
          visitTime: visit.visitTime,
          visitDoctor: visit.visitDoctor,
          countVisitFrequency:visit.countVisitFrequency,
          frequencyStatus: visit.frequencyStatus,
          multiDateFrequencyArray: visit.multiDateFrequencyArray,

          visitWorkingWith: visit.visitWorkingWith,
          products: visit.visitProduct,
          remark:visit.remark,
          status:visit.status,
          createdBy: visit.createdBy, 
          assignedTo: visit.assignedTo,
           createdAt: visit.createdAt,
        });
      } else if (visitType === "Chemist") {
        if (!ChemistCreatedDate[createdDate]) {
          ChemistCreatedDate[createdDate] = [];
        }
        ChemistCreatedDate[createdDate].push({
          _id: visit._id,
          visitDate: visit.visitDate,
          visitTime: visit.visitTime,
          visitChemist: visit.visitChemist,
          countVisitFrequency:visit.countVisitFrequency,
          frequencyStatus: visit.frequencyStatus,
          multiDateFrequencyArray: visit.multiDateFrequencyArray,

          visitWorkingWith: visit.visitWorkingWith,
          products: visit.visitProduct,
          remark:visit.remark,
          status:visit.status,
          createdBy: visit.createdBy, 
          assignedTo: visit.assignedTo,
           createdAt: visit.createdAt,
        });
      }
    });

    res.status(200).json({
      message: "Visits fetched successfully",
      DoctorVisitDate,
      ChemistVisitDate,
      DoctorCreatedDate, // Include CreatedDate in the response
      ChemistCreatedDate,
      totalRecords,
      pagination: true,
      currentPage: parseInt(page),
      perPage: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching visits:", error.message);
    res.status(500).json({ error: "Internal server error while fetching visits." });
  }
};
  



  
  
  
 
 
const getSingleVisit = async (req, res) => {
  try {
    const { _id } = req.query; // Extract visit ID from query
    if (!_id) {
      return res.status(400).json({ message: 'Visit ID is required.' });
    }

    const visit = await Visit.findById(_id)
      .populate('visitDoctor', 'name email roles area visitFrequency ')
      // .populate('visitEmployee', 'name email roles image')
      // .populate('visitManager', 'name email roles image')

      .populate("visitChemist", "name email roles area visitFrequency ")
      .populate("visitProduct")
      .populate({ path: "remark", populate: { path: "createdBy", select: "name email roles image" } })
      .populate('createdBy', 'name email roles image')
      .populate( "assignedTo",  "name email roles image" )

        
    

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    res.status(200).json({ message: 'Visit fetched successfully', visit });
  } catch (error) {
    console.error('Error fetching visit:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching visit.' });
  }
};



// Update a visit
 
const updateVisit = async (req, res) => {
  try {
    const { id, roles } = req.user;
    const { _id, frequencyStatus, visitDate, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Visit ID (_id) is required for updating." });
    }

    const visit = await Visit.findById(_id)
      .populate("visitDoctor", "visitFrequency") // Populate doctor visit frequency
      .populate("visitChemist", "visitFrequency"); // Populate chemist visit frequency

    if (!visit) {
      return res.status(404).json({ message: "Visit not found." });
    }

    // Only allow Admin, Manager, or the creator of the visit to update it
    if (roles !== "Admin" && roles !== "Manager" && visit.createdBy.toString() !== id) {
      return res
        .status(403)
        .json({ message: "Access denied: You are not authorized to update this visit." });
    }

    // Determine maxFrequency based on doctor or chemist's visitFrequency
    const maxFrequency =
      visit.visitDoctor?.visitFrequency || visit.visitChemist?.visitFrequency;

    if (!maxFrequency) {
      return res.status(400).json({
        message: "Unable to determine visit frequency for the doctor or chemist.",
      });
    }

    console.log("Max Frequency:", maxFrequency);
    console.log("Current CountVisitFrequency:", visit.countVisitFrequency);

    // Frequency Status Handling
    if (frequencyStatus) {
      console.log("Frequency Status Received:", frequencyStatus);

      if (frequencyStatus === "Complete") {
        if (visit.countVisitFrequency < maxFrequency) {
          visit.countVisitFrequency += 1; // Increment frequency only on completion
          console.log("Incremented CountVisitFrequency:", visit.countVisitFrequency);

          if (visit.countVisitFrequency === maxFrequency) {
            visit.frequencyStatus = "Complete"; // Mark as Complete when max frequency is reached
            visit.visitDate =
              visit.multiDateFrequencyArray[visit.multiDateFrequencyArray.length - 1] || null;
            console.log("Maximum Frequency Reached:", visit.countVisitFrequency);
          } else {
            visit.frequencyStatus = "In Complete"; // Reset to In Complete if max frequency not reached
            visit.visitDate = null; // Ensure visitDate remains null until frequency is complete
            console.log("Frequency Status Set to In Complete");
          }
        } else {
          console.log("Maximum Frequency Reached, Increment Ignored");
        }
      } else if (frequencyStatus === "In Complete") {
        visit.frequencyStatus = "In Complete"; // Set to "In Complete" without incrementing frequency
        visit.visitDate = null; // Ensure visitDate remains null until frequency is complete
        console.log("Frequency Status Set to In Complete");
      } else {
        visit.frequencyStatus = frequencyStatus; // Handle other statuses if needed
        console.log("Frequency Status Set to:", frequencyStatus);
      }
    } else if (visitDate) {
      // Visit Date Handling (only if visitDate is provided)
      const formattedVisitDate = moment(visitDate, ["YYYY-MM-DD", "DD-MM-YYYY"]).format("DD-MM-YYYY");

      // Add the new visit date to multiDateFrequencyArray (duplicates allowed)
      visit.multiDateFrequencyArray.push(formattedVisitDate);

      // Keep visitDate updated as per user input
      visit.visitDate = formattedVisitDate;
    }

    // Update other visit fields
    Object.assign(visit, updateData); // Merge other updates into the visit object

    // Save the updated visit
    const updatedVisit = await visit.save();

    console.log("Final Visit Object:", updatedVisit);

    res.status(200).json({
      message: "Visit updated successfully.",
      visit: updatedVisit,
    });
  } catch (error) {
    console.error("Error updating visit:", error.message);
    res.status(500).json({ error: `Internal server error while updating visit: ${error.message}` });
  }
};







 

module.exports = {
  createVisit,
  // createDoctorVisit,
  // createChemistVisit,
  getVisits,
  getSingleVisit,
  updateVisit,
};
