const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const OrderSchema = new mongoose.Schema({
  orderid: {
    type: Number
  },
  customerName: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  discount: {
    type: Number,
    default: 0
  },
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
    },
    type: {
      type: String,
      enum: ['normal', 'spicy'],
      default: 'normal'
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

OrderSchema.plugin(AutoIncrement, { inc_field: 'orderid' });

module.exports = mongoose.model('Order', OrderSchema);
