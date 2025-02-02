const { User } = require("../model/userModel");
const { Product , Category } = require("../model/productModel");
 const { Visit, Remark } = require('../model/visitModel');
const Leaves = require("../model/leaveModel");

const searchModels = async (req, res) => {
    try {
      const { modelName, search, roles, page = 1, pageSize = 10 } = req.body;
  
      // Map model names to their schemas
      const validModels = { User, Product, Category,Visit };
      const Model = validModels[modelName];
      if (!Model) {
        return res.status(400).json({ message: "Invalid model name." });
      }
  
      // Define explicitly searchable fields (exclude fields like password, dates, etc.)
      const searchableFields = [
        "name",
        "userId",
        "email",
        "mobile",
        "roles",
        "userName",
        "speciality",
        "area",
        "status",
        "designations",
        "visitId",
        "visitType",
        "visitWorkingWith",
        "frequencyStatus",
        "visitDate",
 
      ];
  
      // Build the search query
      const searchQuery = {
        ...(roles && Array.isArray(roles) && roles.length > 0
          ? { roles: { $in: roles } }
          : {}),
        ...(search && search.trim()
          ? {
              $or: searchableFields.map((field) => ({
                [field]: { $regex: search.trim(), $options: "i" },
              })),
            }
          : {}),
      };
  
      // console.log("Refined Search Query:", JSON.stringify(searchQuery, null, 2));
  
      // Pagination parameters
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
  
      // Base query
      let query = Model.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize));
  
      // Conditional population
      if (modelName === "User") {
        query = query.populate("departments", "name"); // Populate departments for User
      } else if (modelName === "Product") {
        query = query.populate("category", "name"); // Populate category for Product
      }else if(modelName === "Visit"){
        query = query
        .populate("visitDoctor", "name area visitFrequency roles")
        .populate("visitChemist", "name area visitFrequency roles")
        .populate("assignedTo", "name roles")
        .populate("createdBy", "name roles")
        .populate("visitProduct", "name");
    }
 
  
      // Execute query and lean transformation
      const data = await query.lean();
  
      // Count total records
      const totalCount = await Model.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalCount / pageSize);
  
        // Process and Return the Response
    const processedData = data.map((item) => ({
      ...item,
      visitDoctorName: item.visitDoctor?.name || "-",
      assignedToNames: item.assignedTo?.map((e) => e.name).join(", ") || "-",
      visitProducts: item.visitProduct?.map((e) => e.name).join(", ") || "-",
    }));

      return res.status(200).json({
        message: "Data fetched successfully!",
        data:processedData,
        
        currentPage: parseInt(page),
        totalPages,
        totalCount,
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  

module.exports = {
  searchModels,
};
