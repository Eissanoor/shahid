const MegaMenu = require('../models/MegaMenu');
const cloudinary = require('../config/cloudinary');

// @desc    Create new megamenu item
// @route   POST /api/megamenu
// @access  Private
exports.createMegaMenu = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a picture'
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'megamenu',
      use_filename: true
    });

    // Create megamenu with Cloudinary URL
    const megaMenu = await MegaMenu.create({
      name: req.body.name,
      pic: result.secure_url
    });

    res.status(201).json({
      success: true,
      message: 'MegaMenu created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all megamenu items
// @route   GET /api/megamenu
// @access  Public
exports.getMegaMenus = async (req, res) => {
  try {
    const megaMenus = await MegaMenu.find();

    res.status(200).json({
      success: true,
      count: megaMenus.length,
      data: megaMenus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single megamenu item
// @route   GET /api/megamenu/:id
// @access  Public
exports.getMegaMenu = async (req, res) => {
  try {
    const megaMenu = await MegaMenu.findById(req.params.id);

    if (!megaMenu) {
      return res.status(404).json({
        success: false,
        error: 'MegaMenu not found'
      });
    }

    res.status(200).json({
      success: true,
      data: megaMenu
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update megamenu item
// @route   PUT /api/megamenu/:id
// @access  Private
exports.updateMegaMenu = async (req, res) => {
  try {
    let megaMenu = await MegaMenu.findById(req.params.id);

    if (!megaMenu) {
      return res.status(404).json({
        success: false,
        error: 'MegaMenu not found'
      });
    }

    // Update with file if provided
    if (req.file) {
      // Extract public_id from the existing image URL if it exists
      if (megaMenu.pic) {
        try {
          // Get public_id from URL
          const publicId = megaMenu.pic.split('/').pop().split('.')[0];
          if (publicId) {
            // Delete the old image from Cloudinary
            await cloudinary.uploader.destroy(`megamenu/${publicId}`);
          }
        } catch (err) {
          console.log('Error deleting old image:', err);
          // Continue even if deletion fails
        }
      }

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'megamenu',
        use_filename: true
      });

      megaMenu = await MegaMenu.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          pic: result.secure_url
        },
        { new: true, runValidators: true }
      );
    } else {
      // Update without changing the picture
      megaMenu = await MegaMenu.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'MegaMenu updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete megamenu item
// @route   DELETE /api/megamenu/:id
// @access  Private
exports.deleteMegaMenu = async (req, res) => {
  try {
    const megaMenu = await MegaMenu.findById(req.params.id);

    if (!megaMenu) {
      return res.status(404).json({
        success: false,
        error: 'MegaMenu not found'
      });
    }

    // Delete the image from Cloudinary if it exists
    if (megaMenu.pic) {
      try {
        // Extract public_id from the URL
        const publicId = megaMenu.pic.split('/').pop().split('.')[0];
        if (publicId) {
          // Delete the image from Cloudinary
          await cloudinary.uploader.destroy(`megamenu/${publicId}`);
          console.log(`Deleted image from Cloudinary: megamenu/${publicId}`);
        }
      } catch (err) {
        console.log('Error deleting image from Cloudinary:', err);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    // Delete the megamenu item from database
    await megaMenu.deleteOne();

    res.status(200).json({
      success: true,
      message: 'MegaMenu deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
