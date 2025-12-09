import mongoose from 'mongoose'; 

const ProductSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: [true, 'กรุณาใส่ชื่อสินค้า'], 
        trim: true,
        unique: true 
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

const Product = mongoose.model('Product', ProductSchema);

export default Product;