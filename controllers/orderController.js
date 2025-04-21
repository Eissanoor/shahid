const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No products in order'
      });
    }

    // Calculate total amount and collect product details
    let totalAmount = 0;
    let receiptItems = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.product}`
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      // Add product details to receipt items
      receiptItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        type: product.type,
        itemTotal: itemTotal
      });
    }

    // Create order
    const order = await Order.create({
      products,
      totalAmount,
      
    });

    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCP-${order._id.toString().slice(-6).toUpperCase()}`,
      date: new Date().toISOString(),
      items: receiptItems,
      subtotal: totalAmount,
      total: totalAmount,
     
      orderStatus: order.status,
      orderReference: order._id
    };

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      receipt: receiptData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'products.product',
        select: 'name pic price type description'
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate({
        path: 'products.product',
        select: 'name pic price'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};



// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Public
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
