const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    vendor: { type: String },
    product_type: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date },
    variants: [
        {
            id: { type: Number },
            title: { type: String },
            price: { type: Number },
            sku: { type: String },
            inventory_quantity: { type: Number }
        }
    ],
    images: [{ type: String }], // Storing image URLs
    tags: { type: String }, // Shopify stores tags as a comma-separated string
    status: { type: String }
});

module.exports = mongoose.model('Product', ProductSchema);
