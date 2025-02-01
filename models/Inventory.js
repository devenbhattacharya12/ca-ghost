const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    inventory_item_id: { type: Number, required: true, unique: true },
    product_id: { type: Number, required: true },
    variant_id: { type: Number },
    location_id: { type: Number, required: true },
    available: { type: Number, required: true },
    updated_at: { type: Date }
});

module.exports = mongoose.model('Inventory', InventorySchema);
