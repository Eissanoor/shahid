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
const { cacheMiddleware, clearCache } = require('../middlewares/apicache');
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
  .post(protect, clearCache, upload.single('pic'), createMegaMenu)
  .get(cacheMiddleware('5 minutes'), getMegaMenus);

// Define specific routes before parameterized routes
router
  .route('/all/products')
  .get(cacheMiddleware('5 minutes'), getAllMegaMenusWithProducts);

router
  .route('/:id')
  .get(cacheMiddleware('5 minutes'), getMegaMenu)
  .put(protect, clearCache, upload.single('pic'), updateMegaMenu)
  .delete(protect, clearCache, deleteMegaMenu);

router
  .route('/:id/products')
  .get(cacheMiddleware('5 minutes'), getMegaMenuProducts);

module.exports = router;
