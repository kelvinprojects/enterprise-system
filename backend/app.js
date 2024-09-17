const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');
const invoicesRouter = require('./routes/invoices');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config(); // Load environment variables at the start

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/landing.html')); // Ensure the path is correct
});
// Example login route in your Express app
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  console.log(`Received login request with username: ${username}`); // Debug log

  // Hardcoded credentials check (Replace this with actual authentication logic)
  if (username === 'Admin' && password === '@dm1n.12345') {
    console.log('Login successful'); // Debug log
    res.status(200).json({ redirect: '/index.html' }); // Successful login with redirect URL
  } else {
    console.log('Login failed'); // Debug log
    res.status(401).send(); // Unauthorized
  }
});


// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI; // Use MONGODB_URI from .env file
if (!mongoURI) {
  console.error('MongoDB URI is missing. Please check your .env file.');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Start server and open the browser
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  const url = `http://localhost:${PORT}`;
  openBrowser(url);
});

// Function to open the default browser
function openBrowser(url) {
  let startCommand;

  if (process.platform === 'win32') {
    startCommand = `start ${url}`;
  } else if (process.platform === 'darwin') {
    startCommand = `open ${url}`;
  } else if (process.platform === 'linux') {
    startCommand = `xdg-open ${url}`;
  }

  exec(startCommand, (err) => {
    if (err) {
      console.log('Error opening browser:', err);
    }
  });
}

// Backend route to get products (Make sure Product is defined properly)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // Make sure Product model is imported
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Functions related to invoices and modal interactions (For frontend, not backend logic)
function printInvoice() {
  window.print(); // This code should be in frontend JS file
}

function reviewInvoice(customerName, date) {
  const invoiceDetails = `
    <p>Customer: ${customerName}</p>
    <p>Date: ${date}</p>
    <p>Item 1: 10 pcs - $100</p>
    <p>Item 2: 5 pcs - $50</p>
    <p>Total: $150</p>
  `;

  document.getElementById('invoiceDetails').innerHTML = invoiceDetails;
  document.getElementById('reviewModal').style.display = 'block';
}

function closeReviewModal() {
  document.getElementById('reviewModal').style.display = 'none';
}

function deleteInvoice() {
  alert('Invoice deleted'); // Implement actual delete logic
}
