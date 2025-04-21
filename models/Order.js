const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1']
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
