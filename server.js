require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

const app = express();
app.use(express.json());

// Ensure MONGO_URI and Shopify credentials are set
if (!process.env.MONGO_URI || !process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN) {
    console.error("❌ Required environment variables are missing!");
    process.exit(1);
}

// Connect to MongoDB with improved error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
            socketTimeoutMS: 45000, // Keep connection alive
        });
        console.log("✅ MongoDB Connected Successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Exit process with failure
    }
};
connectDB();

const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2023-01`;
const HEADERS = {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
};

// Test API Route
app.get('/', (req, res) => {
    res.send("Clear-Analytics-Ghost API is Running...");
});

// Fetch and store Shopify orders
app.get('/fetch-orders', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/orders.json`, { headers: HEADERS });
        const orders = response.data.orders;
        await Order.insertMany(orders, { ordered: false });
        res.status(201).json({ message: "✅ Orders fetched and stored!" });
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch and store Shopify customers
app.get('/fetch-customers', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/customers.json`, { headers: HEADERS });
        const customers = response.data.customers;
        await Customer.insertMany(customers, { ordered: false });
        res.status(201).json({ message: "✅ Customers fetched and stored!" });
    } catch (error) {
        console.error("❌ Error fetching customers:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch and store Shopify products
app.get('/fetch-products', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/products.json`, { headers: HEADERS });
        const products = response.data.products;
        await Product.insertMany(products, { ordered: false });
        res.status(201).json({ message: "✅ Products fetched and stored!" });
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch and store Shopify inventory
app.get('/fetch-inventory', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/inventory_levels.json`, { headers: HEADERS });
        const inventory = response.data.inventory_levels;
        await Inventory.insertMany(inventory, { ordered: false });
        res.status(201).json({ message: "✅ Inventory fetched and stored!" });
    } catch (error) {
        console.error("❌ Error fetching inventory:", error);
        res.status(500).json({ error: error.message });
    }
});

// Shopify Webhook: Listen for new orders
app.post('/webhook/orders/create', async (req, res) => {
    try {
        const newOrder = req.body; // Shopify sends the new order here

        // Store new order in MongoDB
        await Order.create(newOrder);

        console.log("✅ New Order Stored:", newOrder.id);
        res.status(200).json({ message: "✅ Order received and stored!" });
    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        res.status(500).json({ error: error.message });
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
