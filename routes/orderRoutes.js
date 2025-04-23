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
  .post(createOrder)
  .get(getAllOrders);

// Order history by period or date range
router.get('/history', getOrderHistory);

router
  .route('/:id')
  .get(getOrderById)
  .delete(deleteOrder);

module.exports = router;
