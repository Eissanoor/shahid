const express = require('express');
const {
  getDashboardStats,
  getTotalProductsCount,
  getMenuItemsCount,
  getOrdersTodayCount,
  getTodayRevenue,
  getPopularProducts
} = require('../controllers/dashboardController');

const router = express.Router();

// Get all dashboard stats in one request
router.get('/stats', getDashboardStats);

// Individual endpoints for each stat
router.get('/products/count', getTotalProductsCount);
router.get('/menu-items/count', getMenuItemsCount);
router.get('/orders/today/count', getOrdersTodayCount);
router.get('/revenue/today', getTodayRevenue);

// Popular products endpoint
router.get('/popular-products', getPopularProducts);

module.exports = router;
