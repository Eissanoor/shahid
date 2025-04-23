const Product = require('../models/Product');
const Order = require('../models/Order');
const MegaMenu = require('../models/MegaMenu');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Public
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get menu items count
    const menuItems = await MegaMenu.countDocuments();

    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get orders today count
    const ordersToday = await Order.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get today's revenue
    const todayOrders = await Order.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Calculate total revenue from today's orders
    const formattedRevenue = todayOrders.reduce((total, order) => total + order.totalAmount, 0);
    //revenue formateed like 10,000 . 100,000 like this
    const revenue = new Intl.NumberFormat('en-US').format(formattedRevenue);
    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        menuItems,
        ordersToday,
        revenue
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get total products count
 * @route   GET /api/dashboard/products/count
 * @access  Public
 */
exports.getTotalProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    
    res.status(200).json({
      success: true,
      data: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get menu items count
 * @route   GET /api/dashboard/menu-items/count
 * @access  Public
 */
exports.getMenuItemsCount = async (req, res) => {
  try {
    const count = await MegaMenu.countDocuments();
    
    res.status(200).json({
      success: true,
      data: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get orders today count
 * @route   GET /api/dashboard/orders/today/count
 * @access  Public
 */
exports.getOrdersTodayCount = async (req, res) => {
  try {
    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await Order.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.status(200).json({
      success: true,
      data: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get today's revenue
 * @route   GET /api/dashboard/revenue/today
 * @access  Public
 */
exports.getTodayRevenue = async (req, res) => {
  try {
    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const orders = await Order.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Calculate total revenue
    const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
    
    res.status(200).json({
      success: true,
      data: revenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
