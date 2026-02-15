import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true, trim: true, index: true },
}, { timestamps: true });

categorySchema.index({ name: 1, store_id: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);