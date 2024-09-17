const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  serialCode: { type: String, unique: true, required: true },
  quantityInStock: { type: Number, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: 'path/to/placeholder-image.png' },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
