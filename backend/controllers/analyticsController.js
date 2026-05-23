const Order = require('../model/order');
const User = require('../model/user');
const Product = require('../model/product');

const getAdminStates = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({role: 'user'});
        const totalOrders = await Order.countDocuments({});
        const totalProducts = await Product.countDocuments({});

        const deliveredOrders = await Order.find({ status: 'delivered' });

        const totalRevenueData = deliveredOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue: totalRevenueData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch admin states' });
    }   
};

module.exports = {
    getAdminStates,
};
