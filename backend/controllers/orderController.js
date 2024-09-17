const Order = require('../models/Order');

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  const { customerName, items } = req.body;

  try {
    // Calculate total price
    let totalPrice = 0;
    items.forEach(item => {
      totalPrice += item.price * item.quantity; // Assuming price comes from front-end
    });

    const newOrder = new Order({
      customerName,
      items,
      totalPrice,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};

module.exports = { getOrders, createOrder, updateOrderStatus };
