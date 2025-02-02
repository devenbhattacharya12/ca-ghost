const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    order_number: { type: String, required: true },
    total_price: { type: String, required: true },
    line_items: [
        {
            product_id: { type: Number },
            variant_id: { type: Number },
            name: { type: String },
            quantity: { type: Number },
            price: { type: String }
        }
    ],
    customer: {
        id: { type: Number },
        first_name: { type: String },
        last_name: { type: String },
        email: { type: String }
    },
    created_at: { type: Date, required: true },
    financial_status: { type: String },
    fulfillment_status: { type: String }
});

module.exports = mongoose.model('Order', OrderSchema);
