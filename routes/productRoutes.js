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
  .post(protect, upload.single('pic'), createProduct)
  .get(getProducts);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, upload.single('pic'), updateProduct)
  .delete(protect, deleteProduct);

router
  .route('/megamenu/:megaMenuId')
  .get(getProductsByMegaMenu);

module.exports = router;
