const express = require('express');
const { cacheMiddleware, clearCache } = require('../middlewares/apicache');
const {
  createOrder,
  getOrderById,
  getAllOrders,
  deleteOrder,
  getOrderHistory
} = require('../controllers/orderController');

const router = express.Router();

router
  .route('/')
  .post(clearCache, createOrder)
  .get(cacheMiddleware('5 minutes'), getAllOrders);

// Order history by period or date range
router.get('/history', cacheMiddleware('5 minutes'), getOrderHistory);

router
  .route('/:id')
  .get(cacheMiddleware('5 minutes'), getOrderById)
  .delete(clearCache, deleteOrder);

module.exports = router;
