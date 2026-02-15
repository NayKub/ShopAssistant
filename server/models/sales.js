import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    items: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price_at_sale: Number, // ราคาสินค้า ณ วันที่ขาย
        cost_at_sale: Number   // ต้นทุน ณ วันที่ขาย
    }],
    total_income: { type: Number, default: 0 },
    total_profit: { type: Number, default: 0 },
    sale_date: { type: Date, default: Date.now } // 💡 สำคัญมากสำหรับสร้างกราฟ
});

export default mongoose.model('Sale', saleSchema);