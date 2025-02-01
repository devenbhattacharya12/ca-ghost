const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    email: { type: String, required: true },
    first_name: { type: String },
    last_name: { type: String },
    total_spent: { type: String },
    orders_count: { type: Number },
    created_at: { type: Date },
    updated_at: { type: Date }
});

module.exports = mongoose.model('Customer', CustomerSchema);
