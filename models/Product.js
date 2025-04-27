const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  pic: {
    type: String,
    required: [true, 'Please add a picture']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  type: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: [true, 'Please add a type']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  sales: {
    type: Number,
    default: 0
  },
  megaMenu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MegaMenu',
    required: [true, 'Please add a megamenu category']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
