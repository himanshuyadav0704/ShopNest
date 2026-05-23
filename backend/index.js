const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const sendEmail = require("./utils/sendEmail");
const path = require('path');


dotenv.config();
connectDB();




const app = express();
app.use(cors(
    {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000", process.env.FRONTEND_URL],
        credentials: true
        }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files first
const buildPath = path.join(__dirname, '../frontend/build');
try {
  if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
  } else {
    console.warn('Frontend build not found at:', buildPath);
  }
} catch (err) {
  console.warn('Frontend build directory error:', err.message);
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')); 
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
// app.use('/api/cart', require('./routes/cartRoutes'));

// Fallback: serve frontend index.html for all other routes
if (require('fs').existsSync(buildPath)) {
  app.use((req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} hehe`)
})