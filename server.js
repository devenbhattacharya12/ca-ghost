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

// Fetch and store Shopify orders with full data
app.get('/fetch-orders', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/orders.json?fields=id,name,total_price,line_items,customer,created_at,financial_status,fulfillment_status`, { headers: HEADERS });
        const orders = response.data.orders.map(order => ({
            id: order.id,
            order_number: order.name,
            total_price: order.total_price,
            line_items: order.line_items.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            customer: order.customer ? {
                id: order.customer.id,
                first_name: order.customer.first_name,
                last_name: order.customer.last_name,
                email: order.customer.email
            } : null,
            created_at: order.created_at,
            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status
        }));
        await Order.insertMany(orders, { ordered: false });
        res.status(201).json({ message: "✅ Orders fetched and stored with full details!" });
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch and store Shopify customers with full data
app.get('/fetch-customers', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/customers.json?fields=id,first_name,last_name,email,phone,orders_count,total_spent,created_at,updated_at,addresses`, { headers: HEADERS });
        const customers = response.data.customers.map(customer => ({
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            phone: customer.phone,
            orders_count: customer.orders_count,
            total_spent: customer.total_spent,
            created_at: customer.created_at,
            updated_at: customer.updated_at,
            addresses: customer.addresses
        }));
        await Customer.insertMany(customers, { ordered: false });
        res.status(201).json({ message: "✅ Customers fetched and stored with full details!" });
    } catch (error) {
        console.error("❌ Error fetching customers:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch and store Shopify products
app.get('/fetch-products', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/products.json?fields=id,title,body_html,vendor,product_type,created_at,updated_at,variants,images,tags,status`, { headers: HEADERS });
        const products = response.data.products.map(product => ({
            id: product.id,
            title: product.title,
            description: product.body_html,
            vendor: product.vendor,
            product_type: product.product_type,
            created_at: product.created_at,
            updated_at: product.updated_at,
            variants: product.variants.map(variant => ({
                id: variant.id,
                title: variant.title,
                price: variant.price,
                sku: variant.sku,
                inventory_quantity: variant.inventory_quantity
            })),
            images: product.images.map(image => image.src),
            tags: product.tags,
            status: product.status
        }));
        await Product.insertMany(products, { ordered: false });
        res.status(201).json({ message: "✅ Products fetched and stored!" });
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch and store Shopify inventory with full data
app.get('/fetch-inventory', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/inventory_levels.json?fields=inventory_item_id,location_id,available,updated_at`, { headers: HEADERS });
        const inventory = response.data.inventory_levels.map(item => ({
            inventory_item_id: item.inventory_item_id,
            location_id: item.location_id,
            available: item.available,
            updated_at: item.updated_at
        }));
        await Inventory.insertMany(inventory, { ordered: false });
        res.status(201).json({ message: "✅ Inventory fetched and stored with full details!" });
    } catch (error) {
        console.error("❌ Error fetching inventory:", error);
        res.status(500).json({ error: error.message });
    }
});

// Shopify Webhook: Listen for new orders
app.post('/webhook/orders/create', async (req, res) => {
    try {
        console.log("📩 Received Shopify Order Webhook:", JSON.stringify(req.body, null, 2));

        const newOrder = req.body;

        // Store new order in MongoDB
        await Order.create({
            id: newOrder.id,
            order_number: newOrder.name,
            total_price: newOrder.total_price,
            line_items: newOrder.line_items.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            customer: newOrder.customer ? {
                id: newOrder.customer.id,
                first_name: newOrder.customer.first_name,
                last_name: newOrder.customer.last_name,
                email: newOrder.customer.email
            } : null,
            created_at: newOrder.created_at,
            financial_status: newOrder.financial_status,
            fulfillment_status: newOrder.fulfillment_status
        });

        console.log("✅ New Order Stored in MongoDB:", newOrder.id);
        res.status(200).json({ message: "✅ Order received and stored!" });
    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/webhook/products/create', async (req, res) => {
    try {
        console.log("📩 Received Shopify Product Webhook:", JSON.stringify(req.body, null, 2));

        const product = req.body;

        await Product.create({
            id: product.id,
            title: product.title,
            description: product.body_html,
            vendor: product.vendor,
            product_type: product.product_type,
            created_at: product.created_at,
            updated_at: product.updated_at,
            variants: product.variants.map(variant => ({
                id: variant.id,
                title: variant.title,
                price: variant.price,
                sku: variant.sku,
                inventory_quantity: variant.inventory_quantity
            })),
            images: product.images.map(image => image.src),
            tags: product.tags,
            status: product.status
        });

        console.log("✅ New Product Stored in MongoDB:", product.id);
        res.status(200).json({ message: "✅ Product received and stored!" });
    } catch (error) {
        console.error("❌ Error processing product webhook:", error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/webhook/inventory/update', async (req, res) => {
    try {
        console.log("📩 Received Shopify Inventory Webhook:", JSON.stringify(req.body, null, 2));

        const inventoryUpdate = req.body;

        await Inventory.findOneAndUpdate(
            { inventory_item_id: inventoryUpdate.inventory_item_id },
            {
                inventory_item_id: inventoryUpdate.inventory_item_id,
                location_id: inventoryUpdate.location_id,
                available: inventoryUpdate.available,
                updated_at: inventoryUpdate.updated_at
            },
            { upsert: true }
        );

        console.log("✅ Inventory Updated in MongoDB:", inventoryUpdate.inventory_item_id);
        res.status(200).json({ message: "✅ Inventory update received and stored!" });
    } catch (error) {
        console.error("❌ Error processing inventory webhook:", error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/webhook/customers/create', async (req, res) => {
    try {
        console.log("📩 Received Shopify Customer Webhook:", JSON.stringify(req.body, null, 2));

        const customer = req.body;

        await Customer.create({
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            phone: customer.phone,
            orders_count: customer.orders_count,
            total_spent: customer.total_spent,
            created_at: customer.created_at,
            updated_at: customer.updated_at,
            addresses: customer.addresses
        });

        console.log("✅ New Customer Stored in MongoDB:", customer.id);
        res.status(200).json({ message: "✅ Customer received and stored!" });
    } catch (error) {
        console.error("❌ Error processing customer webhook:", error);
        res.status(500).json({ error: error.message });
    }
});




// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
