const mongoose = require('mongoose');

const MegaMenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  pic: {
    type: String,
    required: [true, 'Please add a picture']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MegaMenu', MegaMenuSchema);
