// models/Category.js (ใหม่)
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store', 
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        // เพิ่ม index เพื่อให้ค้นหาเร็วขึ้น
        index: true 
    },
}, { timestamps: true });

// 💡 เพิ่ม Unique Index แบบ Composite เพื่อให้ชื่อ Category ซ้ำกันได้ ถ้าอยู่คนละร้าน
categorySchema.index({ name: 1, store_id: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;