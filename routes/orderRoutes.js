const express = require('express');
const {
  createOrder,
  getOrderById,
  getAllOrders,
  deleteOrder
} = require('../controllers/orderController');

const router = express.Router();

router
  .route('/')
  .post(createOrder)
  .get(getAllOrders);

router
  .route('/:id')
  .get(getOrderById)
  .delete(deleteOrder);

module.exports = router;
