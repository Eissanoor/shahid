const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { products, customerName, phoneNumber } = req.body;

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
        orderid: product.orderid,
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
      customerName,
      phoneNumber
    });

    // Increment sales count for each product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { sales: item.quantity } });
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCP-${order._id.toString().slice(-6).toUpperCase()}`,
      date: new Date().toISOString(),
      items: receiptItems,
      subtotal: totalAmount,
      total: totalAmount,
      orderid: order.orderid,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
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

// @desc    Get order history by period or date range
// @route   GET /api/orders/history
// @access  Public
exports.getOrderHistory = async (req, res) => {
  try {
    const { period, start, end } = req.query;
    let startDate, endDate;
    const now = new Date();

    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (period === 'week') {
      // Week starts on Monday
      const day = now.getDay() || 7;
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(now.getDate() - day + 1);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
      endDate.setDate(endDate.getDate() + 1); // include end day
    }

    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter)
      .sort('-createdAt')
      .populate({
        path: 'products.product',
        select: 'name pic price type'
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

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    const { products, customerName, phoneNumber, status } = req.body;
    const orderId = req.params.id;
    
    // Find the order
    let order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (products && products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No products in order'
      });
    }
    
    // Calculate total amount and collect product details
    let totalAmount = order.totalAmount;
    let receiptItems = [];
    let updatedProducts = order.products;
    
    if (products && products.length > 0) {
      // Reset total amount
      totalAmount = 0;
      updatedProducts = products;
      
      // Calculate new total and collect product details
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
          orderid: product.orderid,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          type: product.type,
          itemTotal: itemTotal
        });
      }
      
      // Update sales count for products
      for (const item of products) {
        // We don't increment sales here since this is an update
        // If needed, you could calculate the difference and update accordingly
      }
    } else {
      // If no products provided, use existing order data for receipt
      const populatedOrder = await Order.findById(orderId).populate({
        path: 'products.product',
        select: 'name price type'
      });
      
      populatedOrder.products.forEach(item => {
        const itemTotal = item.product.price * item.quantity;
        receiptItems.push({
          productId: item.product._id,
          orderid: item.product.orderid,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          type: item.product.type,
          itemTotal: itemTotal
        });
      });
    }
    
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        products: updatedProducts,
        totalAmount,
        customerName: customerName !== undefined ? customerName : order.customerName,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : order.phoneNumber,
        status: status !== undefined ? status : order.status
      },
      { new: true, runValidators: true }
    );
    
    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCP-${updatedOrder._id.toString().slice(-6).toUpperCase()}`,
      date: new Date().toISOString(),
      items: receiptItems,
      subtotal: totalAmount,
      total: totalAmount,
      orderid: updatedOrder.orderid,
      customerName: updatedOrder.customerName,
      phoneNumber: updatedOrder.phoneNumber,
      orderStatus: updatedOrder.status,
      orderReference: updatedOrder._id
    };
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      receipt: receiptData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get today's product sales count
// @route   GET /api/orders/today-sales
// @access  Public
exports.getTodaySalesCount = async (req, res) => {
  try {
    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Find orders created today
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    }).populate({
      path: 'products.product',
      select: 'name pic price type'
    });

    // Calculate total products sold
    const productSales = {};
    let totalSales = 0;

    todayOrders.forEach(order => {
      order.products.forEach(item => {
        const productId = item.product._id.toString();
        const productName = item.product.name;
        const quantity = item.quantity;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            name: productName,
            count: 0,
            productId: productId,
            type: item.product.type,
            price: item.product.price
          };
        }
        
        productSales[productId].count += quantity;
        totalSales += quantity;
      });
    });

    // Convert to array for easier frontend consumption
    const productSalesArray = Object.values(productSales);

    res.status(200).json({
      success: true,
      totalSales,
      totalOrders: todayOrders.length,
      products: productSalesArray
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
