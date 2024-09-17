const Invoice = require('../models/Invoice');
const Order = require('../models/order');

// Create an invoice based on an order
const createInvoice = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const newInvoice = new Invoice({
      orderId: order._id,
      customerName: order.customerName,
      items: order.items,
      totalPrice: order.totalPrice,
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice' });
  }
};

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('orderId');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

module.exports = { createInvoice, getInvoices };
