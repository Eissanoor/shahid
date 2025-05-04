const Product = require('../models/Product');
const MegaMenu = require('../models/MegaMenu');
const cloudinary = require('../config/cloudinary');

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a picture'
      });
    }

    // Check if megaMenu exists
    const megaMenu = await MegaMenu.findById(req.body.megaMenu);
    if (!megaMenu) {
      return res.status(404).json({
        success: false,
        error: 'MegaMenu not found'
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'products',
      use_filename: true
    });

    // Create product with Cloudinary URL
    const product = await Product.create({
      name: req.body.name,
      pic: result.secure_url,
      description: req.body.description,
      type: req.body.type,
      price: req.body.price,
      megaMenu: req.body.megaMenu
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // Build query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude (including 'search')
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\\b(gt|gte|lt|lte|in)\\b/g, match => `$${match}`);
    
    // Finding resource with optional partial search
    let baseQuery = JSON.parse(queryStr);
    if (req.query.search) {
      baseQuery.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    query = Product.find(baseQuery).populate('megaMenu', 'name pic');
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Executing query
    const products = await query;
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get products by megaMenu
// @route   GET /api/products/megamenu/:megaMenuId
// @access  Public
exports.getProductsByMegaMenu = async (req, res) => {
  try {
    const products = await Product.find({ megaMenu: req.params.megaMenuId }).populate('megaMenu', 'name pic');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('megaMenu', 'name pic');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if megaMenu exists if it's being updated
    if (req.body.megaMenu) {
      const megaMenu = await MegaMenu.findById(req.body.megaMenu);
      if (!megaMenu) {
        return res.status(404).json({
          success: false,
          error: 'MegaMenu not found'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      type: req.body.type || product.type,
      price: req.body.price || product.price,
      megaMenu: req.body.megaMenu || product.megaMenu
    };

    // Update with file if provided
    if (req.file) {
      // Delete the old image from Cloudinary if it exists
      if (product.pic) {
        try {
          // Get public_id from URL
          const publicId = product.pic.split('/').pop().split('.')[0];
          if (publicId) {
            // Delete the old image from Cloudinary
            await cloudinary.uploader.destroy(`products/${publicId}`);
          }
        } catch (err) {
          console.log('Error deleting old image:', err);
          // Continue even if deletion fails
        }
      }

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'products',
        use_filename: true
      });

      updateData.pic = result.secure_url;
    }

    // Update the product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Delete the image from Cloudinary if it exists
    if (product.pic) {
      try {
        // Extract public_id from the URL
        const publicId = product.pic.split('/').pop().split('.')[0];
        if (publicId) {
          // Delete the image from Cloudinary
          await cloudinary.uploader.destroy(`products/${publicId}`);
          console.log(`Deleted image from Cloudinary: products/${publicId}`);
        }
      } catch (err) {
        console.log('Error deleting image from Cloudinary:', err);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    // Delete the product from database
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
