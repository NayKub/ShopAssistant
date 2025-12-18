import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
    store_name: {
        type: String,
        required: [true, 'กรุณาใส่ชื่อสาขา/ร้านค้า'],
        trim: true,
        unique: true
    },
    location: {
        type: String,
        required: [true, 'กรุณาระบุที่ตั้งของสาขา']
    },
    // ฟิลด์ _id ที่ถูกสร้างขึ้นอัตโนมัติ จะทำหน้าที่เป็น store_id
}, 
{ 
    timestamps: true 
});

const Store = mongoose.model('Store', StoreSchema);

export default Store;