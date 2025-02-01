const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    id: Number,
    email: String,
    total_price: String,
    created_at: Date
});

module.exports = mongoose.model('Order', OrderSchema);
