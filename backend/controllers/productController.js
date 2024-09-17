const Product = require('../models/Product');

// Create a new product
const createProduct = async (req, res) => {
  const { name, description, category, serialCode, quantityInStock, price } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      category,
      serialCode,
      quantityInStock,
      price,
    });

    await newProduct.save();
    res.status(201).json(newProduct); // Send a valid JSON response
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product' });
  }
};

module.exports = { createProduct };
