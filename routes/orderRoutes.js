const express = require('express');
const { cacheMiddleware, clearCache } = require('../middlewares/apicache');
const {
  createOrder,
  getOrderById,
  getAllOrders,
  deleteOrder,
  updateOrder,
  getOrderHistory,
  getTodaySalesCount
} = require('../controllers/orderController');

const router = express.Router();

router
  .route('/')
  .post(createOrder)
  .get(getAllOrders);

// Order history by period or date range
router.get('/history', getOrderHistory);

// Get today's product sales count
router.get('/today-sales', getTodaySalesCount);

router
  .route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

module.exports = router;
