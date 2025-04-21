const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const compression = require('compression');
// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const userRoutes = require('./routes/userRoutes');
const megaMenuRoutes = require('./routes/megaMenuRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Compress all responses
app.use(compression());

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// No need for local uploads directory since we're using Cloudinary

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/megamenu', megaMenuRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Shahid Project API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
