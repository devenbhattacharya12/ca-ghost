const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    province: { type: String },
    country: { type: String },
    zip: { type: String },
    phone: { type: String },
    default: { type: Boolean }
});

const CustomerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    email: { type: String, required: true },
    first_name: { type: String },
    last_name: { type: String },
    phone: { type: String }, // Added phone number
    orders_count: { type: Number },
    total_spent: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date },
    addresses: [AddressSchema] // Added addresses as an array
});

module.exports = mongoose.model('Customer', CustomerSchema);
