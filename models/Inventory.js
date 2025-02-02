const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    inventory_item_id: { type: Number, required: true, unique: true },
    product_id: { type: Number }, // Some inventory items may not have a product_id
    variant_id: { type: Number }, // Some inventory items may not have a variant_id
    location_id: { type: Number, required: true },
    available: { type: Number, required: true },
    updated_at: { type: Date, required: true } // Last updated timestamp from Shopify
});

module.exports = mongoose.model('Inventory', InventorySchema);
