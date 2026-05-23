const Order = require('../model/order');
const { sendEmail } = require('../utils/sendEmail');


// Create a new order
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, paymentId } = req.body;    
    if(!items || items.length === 0 || !totalAmount || !address) {
        return res.status(400).json({ message: 'Invalid order data' });
    }
    else {
        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentId
        });
        await order.save();
        // Send order confirmation email
        sendEmail(
            req.user.email,
            'Order Confirmation',
            `Your order with ID ${order._id} has been placed successfully!`
        ).catch((emailError) => {
            console.error('Order confirmation email failed:', emailError.message);
        });
        res.status(201).json({ message: 'Order created successfully', order });
    }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id } ).populate('user', 'name email').populate('items.productId', 'name price');
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders (admin only)
const getOrders = async (req, res) => {
    try {
        let orders = await Order.find().populate('user', 'id name');
        // Exclude orders whose user was deleted (populate returns null)
        orders = orders.filter(o => o.user != null);
        res.json(orders);
    }
        catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = String(req.body.status || '').toLowerCase();
        const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        await order.populate('user', 'id name email');
        res.json({ message: 'Order status updated successfully', order });
    }
     catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    myOrders,
    updateOrderStatus
}
