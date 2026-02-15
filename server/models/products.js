import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    store_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    product_name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    cost: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    sold_count: { type: Number, default: 0 },
    image: { type: String, default: 'default-image.jpg' },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);