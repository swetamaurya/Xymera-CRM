const {Product} = require('../model/productModel');
 
// Create a new product
const createProduct = async (req, res) => {
  try {
    // const {name , category} = req.body
    const product = new Product(req.body);
    await product.save();
    res.status(200).json({ message: 'Product created successfully!', product });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ error: 'Internal server error while creating product.' });
  }
};

 const getAllProducts = async (req, res) => {
    try {
      const { roles } = req.user;  
      const { page, limit } = req.query;  
  
      // Role-based access control
      if (!['Admin', 'HR', 'Manager', 'Employee'].includes(roles)) {
        return res.status(403).json({ message: 'Access denied: Unauthorized role.' });
      }
  
      let products;
      let totalProducts;
      let totalPages;
  
      if (!page || !limit) {
        // Fetch all products without pagination
        products = await Product.find()
          .populate('category', 'name')  
          .sort({ createdAt: -1 });
        totalProducts = products.length;
        totalPages = 1;  
      } else {
        // Fetch products with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        products = await Product.find()
          .populate('category', 'name')  
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        totalProducts = await Product.countDocuments();
        totalPages = Math.ceil(totalProducts / parseInt(limit));
      }
  
      const response = {
        message: 'Products fetched successfully!',
        data: products,
        summary: {
          totalProducts,
          totalPages,
          currentPage: page ? parseInt(page) : 1,
          perPage: limit ? parseInt(limit) : totalProducts,
          pagination: Boolean(page && limit),
        },
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ error: 'Internal server error while fetching products.' });
    }
  };
  

// Get a single product by ID
const getSingleProduct = async (req, res) => {
    try {
        const { roles } = req.user; // Extract roles from the authenticated user
        const { id } = req.query; // Extract category ID from the query
      
         // Role-based access control
    if (!['Admin', 'HR', 'Manager', 'Employee'].includes(roles)) {
        return res.status(403).json({ message: 'Access denied: Unauthorized role.' });
      }
  
      if (!id) {
        return res.status(400).json({ message: 'Product ID is required.' });
      }
      const product = await Product.findById(id).populate('category', 'name');
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }
  
      res.status(200).json({ message: 'Product fetched successfully', product });
    } catch (error) {
      console.error('Error fetching product:', error.message);
  
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid product ID.' });
      }
  
      res.status(500).json({ error: 'Internal server error while fetching the product.' });
    }
  };
  
// Update a product
const updateProduct = async (req, res) => {
  try {
    const { _id, ...updateFields } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(_id, updateFields, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product updated successfully.', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ error: 'Internal server error while updating product.' });
  }
};

// // Delete a product
// const deleteProduct = async (req, res) => {
//   try {
//     const { _id } = req.body;
//     const deletedProduct = await Product.findByIdAndDelete(_id);

//     if (!deletedProduct) {
//       return res.status(404).json({ message: 'Product not found.' });
//     }

//     res.status(200).json({ message: 'Product deleted successfully.' });
//   } catch (error) {
//     console.error('Error deleting product:', error.message);
//     res.status(500).json({ error: 'Internal server error while deleting product.' });
//   }
// };

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
//   deleteProduct,
};
