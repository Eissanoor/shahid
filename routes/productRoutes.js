const express = require('express');
const { 
  createProduct, 
  getProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByMegaMenu
} = require('../controllers/productController');
const { protect } = require('../middlewares/auth');
const { cacheMiddleware, clearCache } = require('../middlewares/apicache');
const multer = require('multer');

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize upload - using disk storage for Cloudinary
const upload = multer({
  storage: multer.diskStorage({}),  // Use default disk storage for temporary files
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max size
  fileFilter: fileFilter
});

const router = express.Router();

router
  .route('/')
  .post(protect, clearCache, upload.single('pic'), createProduct)
  .get(cacheMiddleware('5 minutes'), getProducts);

router
  .route('/:id')
  .get(cacheMiddleware('5 minutes'), getProduct)
  .put(protect, clearCache, upload.single('pic'), updateProduct)
  .delete(clearCache, deleteProduct);

router
  .route('/megamenu/:megaMenuId')
  .get(cacheMiddleware('5 minutes'), getProductsByMegaMenu);

module.exports = router;
