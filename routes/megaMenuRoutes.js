const express = require('express');
const { 
  createMegaMenu, 
  getMegaMenus, 
  getMegaMenu, 
  updateMegaMenu, 
  deleteMegaMenu,
  getMegaMenuProducts,
  getAllMegaMenusWithProducts
} = require('../controllers/megaMenuController');
const { protect } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize upload - using memory storage for Cloudinary
const upload = multer({
  storage: multer.diskStorage({}),  // Use default disk storage for temporary files
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max size
  fileFilter: fileFilter
});

const router = express.Router();

router
  .route('/')
  .post(protect, upload.single('pic'), createMegaMenu)
  .get(getMegaMenus);

// Define specific routes before parameterized routes
router
  .route('/all/products')
  .get(getAllMegaMenusWithProducts);

router
  .route('/:id')
  .get(getMegaMenu)
  .put(protect, upload.single('pic'), updateMegaMenu)
  .delete(protect, deleteMegaMenu);

router
  .route('/:id/products')
  .get(getMegaMenuProducts);

module.exports = router;
