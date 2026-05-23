const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./model/user');
const Product = require('./model/product');
const Order = require('./model/order');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopnest')
.then(() => console.log('MongoDB connected for seeding'))
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
}); 

const products = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'Comfortable over-ear headphones with clear sound and long battery life.',
        price: 2499,
        category: 'Electronics',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        ratings: 4.5,
        numReviews: 24
    },
    {
        name: 'Smart Fitness Watch',
        description: 'Track steps, heart rate, workouts, sleep, and daily notifications.',
        price: 3999,
        category: 'Electronics',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        ratings: 4.2,
        numReviews: 17
    },
    {
        name: 'Classic Cotton T-Shirt',
        description: 'Soft breathable cotton t-shirt for everyday casual wear.',
        price: 699,
        category: 'Fashion',
        stock: 80,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        ratings: 4.1,
        numReviews: 32
    },
    {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with cushioned sole and strong grip.',
        price: 2999,
        category: 'Footwear',
        stock: 42,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        ratings: 4.6,
        numReviews: 41
    },
    {
        name: 'Ceramic Coffee Mug',
        description: 'Minimal ceramic mug suitable for hot coffee, tea, or cocoa.',
        price: 349,
        category: 'Home',
        stock: 120,
        imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d',
        ratings: 4,
        numReviews: 11
    },
    {
        name: 'Laptop Backpack',
        description: 'Water-resistant backpack with laptop sleeve and daily storage pockets.',
        price: 1599,
        category: 'Accessories',
        stock: 27,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
        ratings: 4.4,
        numReviews: 19
    }
];

const users = [
    {
        name: 'Admin User',
        email: 'admin@shopnest.com',
        password: 'Admin@123',
        role: 'admin',
        verified: true
    },
    {
        name: 'Demo User',
        email: 'user@shopnest.com',
        password: 'User@123',
        role: 'user',
        verified: true
    },
    {
        name: 'Priya Sharma',
        email: 'priya@shopnest.com',
        password: 'Priya@123',
        role: 'user',
        verified: true
    }
];

const seedData = async () => {
    try {
        await connectDB();

        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10)
            }))
        );

        const createdUsers = [];
        for (const user of hashedUsers) {
            const createdUser = await User.findOneAndUpdate(
                { email: user.email },
                user,
                { returnDocument: 'after', upsert: true, runValidators: true }
            );
            createdUsers.push(createdUser);
        }

        const createdProducts = [];
        for (const product of products) {
            const createdProduct = await Product.findOneAndUpdate(
                { name: product.name },
                product,
                { returnDocument: 'after', upsert: true, runValidators: true }
            );
            createdProducts.push(createdProduct);
        }

        const demoUser = createdUsers.find((user) => user.email === 'user@shopnest.com');
        const priyaUser = createdUsers.find((user) => user.email === 'priya@shopnest.com');

        await Order.deleteMany({
            user: { $in: [demoUser._id, priyaUser._id] },
            paymentId: /^seed_payment_/
        });

        await Order.insertMany([
            {
                user: demoUser._id,
                items: [
                    {
                        productId: createdProducts[0]._id,
                        quantity: 1,
                        price: createdProducts[0].price
                    },
                    {
                        productId: createdProducts[4]._id,
                        quantity: 2,
                        price: createdProducts[4].price
                    }
                ],
                totalAmount: createdProducts[0].price + createdProducts[4].price * 2,
                address: {
                    fullName: 'Demo User',
                    street: '22 MG Road',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    postalCode: '560001',
                    country: 'India'
                },
                paymentId: 'seed_payment_001',
                status: 'processing'
            },
            {
                user: priyaUser._id,
                items: [
                    {
                        productId: createdProducts[3]._id,
                        quantity: 1,
                        price: createdProducts[3].price
                    },
                    {
                        productId: createdProducts[2]._id,
                        quantity: 3,
                        price: createdProducts[2].price
                    }
                ],
                totalAmount: createdProducts[3].price + createdProducts[2].price * 3,
                address: {
                    fullName: 'Priya Sharma',
                    street: '14 Park Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    postalCode: '400001',
                    country: 'India'
                },
                paymentId: 'seed_payment_002',
                status: 'delivered'
            },
            {
                user: demoUser._id,
                items: [
                    {
                        productId: createdProducts[5]._id,
                        quantity: 1,
                        price: createdProducts[5].price
                    }
                ],
                totalAmount: createdProducts[5].price,
                address: {
                    fullName: 'Demo User',
                    street: '22 MG Road',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    postalCode: '560001',
                    country: 'India'
                },
                paymentId: 'seed_payment_003',
                status: 'pending'
            }
        ]);

        console.log('Dummy data seeded successfully');
        console.log('Admin login: admin@shopnest.com / Admin@123');
        console.log('User login: user@shopnest.com / User@123');
        console.log('User login: priya@shopnest.com / Priya@123');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

seedData();
