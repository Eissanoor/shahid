const MegaMenu = require('../models/MegaMenu');
const path = require('path');

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

    // Create megamenu with picture path
    const megaMenu = await MegaMenu.create({
      name: req.body.name,
      pic: `/uploads/${req.file.filename}`
    });

    res.status(201).json({
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
      megaMenu = await MegaMenu.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          pic: `/uploads/${req.file.filename}`
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
      data: megaMenu
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

    await megaMenu.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
