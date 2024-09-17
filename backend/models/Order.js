const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to the Product model
      quantity: { type: Number, required: true },
    }
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Queue', 'Processed', 'Completed'], // Order status options
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now }, // Automatically set the date when the order is created
});

module.exports = mongoose.model('Order', orderSchema);
