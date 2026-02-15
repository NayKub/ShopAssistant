import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
    store_name: { type: String, required: true, trim: true, unique: true },
    location: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Store', StoreSchema);