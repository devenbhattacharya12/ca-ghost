const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    vendor: { type: String },
    product_type: { type: String },
    price: { type: Number },
    variants: [
        {
            id: Number,
            title: String,
            sku: String,
            inventory_quantity: Number,
            price: Number
        }
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});

module.exports = mongoose.model('Product', ProductSchema);
