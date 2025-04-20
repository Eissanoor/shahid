const express = require('express');
const { 
  createMegaMenu, 
  getMegaMenus, 
  getMegaMenu, 
  updateMegaMenu, 
  deleteMegaMenu 
} = require('../controllers/megaMenuController');
const { protect } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max size
  fileFilter: fileFilter
});

const router = express.Router();

router
  .route('/')
  .post(protect, upload.single('pic'), createMegaMenu)
  .get(getMegaMenus);

router
  .route('/:id')
  .get(getMegaMenu)
  .put(protect, upload.single('pic'), updateMegaMenu)
  .delete(protect, deleteMegaMenu);

module.exports = router;
