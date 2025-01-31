const { User } = require("../model/userModel");
 
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');

const bcryptjs = require("bcryptjs")
const sendOTPEmail = require("../utils/mailSent");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

// Generate OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Admin Only
const signUp = async (req, res) => {
    const email = req.body.email.toLowerCase();
    const name = req.body.name;
    const mobile = req.body.mobile;
    const roles = "Admin";
    const status = "Active";

    const hashedPassword = await bcryptjs.hash(req.body.password, 10);
    try {
        const user = await User.findOne({ email: email })
     
        if (user) {
            return res.status(400).json({ error: "Email Id Already Exists" });
        }
        
        const newUser = new User({
            name,
            email,
            mobile,
            roles,
            status,
            password: hashedPassword,
          });

        await newUser.save();

        return res.status(200).send({message:"Admin Created Successfully!",newUser});
    } catch (error) {
        return res.status(400).send(`Internal server error ${error.message}`);
    }
};

// Admin & User
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Please provide email and password.');
  }

  try {
    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).send('Invalid login credentials.');
    }

    // Check if the user is active
    if (user.status !== 'Active') {
      return res.status(403).send('Your account is inactive. Please contact the administrator.');
    }

    // Check if the password matches
    const isPasswordMatch = await bcryptjs.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).send('Invalid login credentials.');
    }

    // Generate JWT token with essential user data
    const token = jwt.sign(
      { 
        _id: user._id, // Include only essential user information in the token
        roles: user.roles,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      process.env.SECRET_KEY,
      { expiresIn: '10h' } // Token expires in 10 hours
    );

    return res.status(200).json({
      message: 'Login successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        status: user.status,
        image: user.image,
      },
    });
  } catch (err) {
    console.error('Internal server error:', err.message);
    return res.status(500).send('Internal server error.');
  }
};


// all user
const resetPassword =  async (req, res) => {
   const { email } = req.body;
// console.log(req.body)
  if (!email) {
    return res.status(400).send("Email is required.");
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).send("User not found.");
    
    const otp = generateOtp();
console.log(otp)
user.currentOtp = otp;
    await user.save();

    // Send OTP email
    sendOTPEmail(user.email, otp);
// console.log(otp)
    res.status(200).json({message:"OTP sent to email successfully."});
  } catch (error) {
    console.error("Internal server error:", error.message);
    res.status(500).send("Internal server error");
  }
}

// create user
const userPost = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    // Role-Specific Validations
    if (roles === "Doctor" || roles === "Chemist") {
      if (!name) {
        return res.status(400).send({ message: 'Name is required for Doctor and Chemist roles.' });
      }
    } else if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required for non-Doctor roles.' });
    }

    // Handle Image Upload
    let imageUrl = ""; // Default to an empty string if no image is uploaded
    if (req.file) {
        try {
            const uploadedUrls = await uploadFileToFirebase(req.file); // Function to handle Firebase upload
            if (Array.isArray(uploadedUrls)) {
                imageUrl = uploadedUrls[0]; // Use the first URL if an array is returned
            } else if (typeof uploadedUrls === "string") {
                imageUrl = uploadedUrls; // Use the string directly if it's not an array
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            return res.status(500).send({ message: 'Image upload failed.' });
        }
    }
    

    // Check for Existing Users (for non-Doctor roles)
    if (roles !== "Doctor" && roles !== "Chemist") {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).send({ message: 'Email already exists.' });
      }
    }

    // Hash Password for Non-Doctor Roles
    const hashedPassword = roles === "Doctor" || roles === "Chemist" ? "" : await bcryptjs.hash(password, 10);

    // Create User
    const newUser = new User({
      ...req.body,
      email: email?.toLowerCase() || "", // Optional email for Doctor/Chemist
      password: hashedPassword,
      image: imageUrl,
    });

    await newUser.save();

    // Response
    return res.status(200).send({ message: `${roles} created successfully!`, newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).send({ message: `Internal server error: ${error.message}` });
  }
};


  
const getAllUser = async (req, res) => {
  try {
    const { roles, _id } = req.user; // Extract roles and user ID from authenticated user
    const { page = 1, limit = 10 } = req.query; // Default page and limit

    let query = {};
    let employeeQuery = {};
    let doctorQuery = { roles: 'Doctor' }; // Explicitly query only doctors
    let chemistQuery = { roles: 'Chemist' }; // Explicitly query only chemists
    let managerQuery = { roles: { $in: ['HR', 'Manager'] } }; // Correct manager query
    let allUsersQuery = {};

    // Define the query based on roles
    if (['Admin', 'HR', 'Manager'].includes(roles)) {
      // Admin, HR, and Manager can see all users
      query = {};
    } else if (roles === 'Employee') {
      // Employees can see themselves and all doctors
      query = { _id: _id }; // Employee can only see their own details
    } else if (roles === 'Doctor' || roles === 'Chemist') {
      // Doctors and Chemists can only see their own data
      query = { _id: _id }; // Only their own details
    } else {
      // Restrict other roles from accessing user data
      return res.status(403).json({ message: 'Access denied: Insufficient permissions.' });
    }

    // Define specific queries for each category
    employeeQuery = { ...query, roles: { $in: ['Employee', 'HR', 'Manager'] } };
 
    allUsersQuery = query;

    // Pagination variables
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginationOptions = {
      skip,
      limit: parseInt(limit),
    };

    // Fetch paginated data
    const [paginatedAllUsers, paginatedEmployees, paginatedManager, paginatedDoctors, paginatedChemists] = await Promise.all([
      User.find(allUsersQuery)
        .populate('departments', 'name')
        .populate('createdBy', 'name email')
        .sort({ _id: -1 })
        .skip(paginationOptions.skip)
        .limit(paginationOptions.limit)
        .lean(),
      User.find(employeeQuery)
        .populate('departments', 'name')
        .sort({ _id: -1 })
        .skip(paginationOptions.skip)
        .limit(paginationOptions.limit)
        .lean(),
        User.find(managerQuery)
        .populate('departments', 'name')
        .sort({ _id: -1 })
        .skip(paginationOptions.skip)
        .limit(paginationOptions.limit)
        .lean(),
      User.find(doctorQuery) // Only fetch users with the role 'Doctor'
        .populate('departments', 'name')
        .sort({ _id: -1 })
        .skip(paginationOptions.skip)
        .limit(paginationOptions.limit)
        .lean(),
      User.find(chemistQuery) // Only fetch users with the role 'Chemist'
        .populate('departments', 'name')
        .sort({ _id: -1 })
        .skip(paginationOptions.skip)
        .limit(paginationOptions.limit)
        .lean(),
    ]);

    // Count totals
    const [totalUsers, totalEmployees,totalManager, totalDoctors, totalChemists] = await Promise.all([
      User.countDocuments(allUsersQuery),
      User.countDocuments(employeeQuery),
      User.countDocuments(managerQuery),
      
      User.countDocuments(doctorQuery),
      User.countDocuments(chemistQuery),
    ]);

    // Calculate total pages
    const totalPagesUsers = Math.ceil(totalUsers / parseInt(limit));
    const totalPagesEmployees = Math.ceil(totalEmployees / parseInt(limit));
    const totalPagesManager = Math.ceil(totalManager / parseInt(limit));

    const totalPagesDoctors = Math.ceil(totalDoctors / parseInt(limit));
    const totalPagesChemists = Math.ceil(totalChemists / parseInt(limit));

    // Prepare the response
    const response = {
      allUsers: paginatedAllUsers,
      employees: paginatedEmployees,
      manager:paginatedManager,
      doctors: paginatedDoctors,
      chemists: paginatedChemists,
      totalUsers,
      totalEmployees,
      totalManager,
      totalDoctors,
      totalChemists,
      totalPagesUsers,
      totalPagesEmployees,
      totalPagesManager,
      totalPagesDoctors,
      totalPagesChemists,
      page: parseInt(page),
      pageSize: parseInt(limit),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};






 

const getUser = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query)

    if (!id) {
      return res.status(400).send("User ID (_id) is required.");
    }

    const user = await User.findById(id)
      .populate('departments', 'name')
      .populate('createdBy', 'name email')
      .lean();

    if (!user) {
      return res.status(404).send("User not found.");
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
};



//update user with password
const updatedUser = async (req, res) => {
    try {
      console.log("Request Payload:", req.body); // Debugging to log incoming data
      const { id, newPassword, ...updateFields } = req.body;
  
      // Check if the User exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      // Handle password update if `newPassword` is provided
      if (newPassword) {
        updateFields.password = await bcryptjs.hash(newPassword, 10);
      }
  
      // Handle file upload and update image URL if a new file is uploaded
      if (req.file) {
        const uploadedUrls = await uploadFileToFirebase(req.file); // Assuming this returns an array of URLs
        updateFields.image = uploadedUrls[0]; // Set the first URL as the new image
      } else {
        updateFields.image = existingUser.image; // Retain the existing image URL if no new file is uploaded
      }
  
      // Update the user with the new data
      const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });
  
      if (!updatedUser) {
        return res.status(500).send({ message: 'Error updating user data' });
      }
  
      // Respond with the updated user details
      return res.status(200).send({ message: 'User updated successfully', updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).send(`Internal server error: ${error.message}`);
    }
  };

 
  
  

 
module.exports = {
    signUp , login , resetPassword , userPost ,getAllUser, getUser , updatedUser  
}