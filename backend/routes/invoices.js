const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// Create a new invoice
router.post('/', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Error creating invoice' });
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('items.productId');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoices' });
  }
});

// Get invoice by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ orderId: req.params.orderId }).populate('items.productId');
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Invoice not found' });
  }
});

module.exports = router;
