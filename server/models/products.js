import mongoose from 'mongoose'; 

const ProductSchema = new mongoose.Schema({
    // Store ID is the primary key for ownership
    store_id: {
        type: mongoose.Schema.Types.ObjectId, 
        required: [true, 'กรุณาระบุรหัสสาขา/ร้านค้าของสินค้า'], 
        index: true 
    },
    product_name: {
        type: String,
        required: [true, 'กรุณาใส่ชื่อสินค้า'], 
        trim: true,
        // *** FIX: REMOVE unique: true ***
        // By removing 'unique: true', we allow duplicate product names across all stores.
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    cost: {
        type: Number,
        required: [true, 'กรุณาใส่ราคาต้นทุน'],
        min: [0, 'ราคาต้นทุนต้องเป็นบวกหรือศูนย์']
    },
    price: {
        type: Number,
        required: [true, 'กรุณาใส่ราคาขาย'],
        min: [0, 'ราคาขายต้องเป็นบวกหรือศูนย์']
    },
    stock: {
        type: Number,
        required: [true, 'กรุณาใส่จำนวนคงคลัง'],
        default: 0,
        min: [0, 'จำนวนคงคลังต้องไม่ติดลบ']
    },

    sold_count: {
        type: Number,
        required: true, 
        default: 0,
        min: [0, 'จำนวนที่ขายได้ต้องเป็นบวกหรือศูนย์']
    },
    image: { 
        type: String, 
        default: 'default-image.jpg' 
    },
}, 
{ 
    timestamps: true 
}); 

// 🛑 CRITICAL ADDITIONAL STEP: Remove the existing unique index from MongoDB
// After changing the code above, the 'product_name_1' unique index
// still exists in your MongoDB database. You must manually drop it.
// Mongoose won't automatically remove an index, only add new ones.
// In your MongoDB shell (or tool like Compass), run:
// db.products.dropIndex("product_name_1")
// Or, if you want product names to be unique *per store*:
// ProductSchema.index({ product_name: 1, store_id: 1 }, { unique: true });
// Then drop the old 'product_name_1' index.

const Product = mongoose.model('Product', ProductSchema);

export default Product;