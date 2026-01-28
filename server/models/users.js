import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'กรุณาใส่ชื่อผู้ใช้งาน (Username)'],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'กรุณาใส่อีเมล'],
        unique: true,
        match: [/.+@.+\..+/, 'กรุณาใส่อีเมลที่ถูกต้อง']
    },
    password: {
        type: String,
        required: [true, 'กรุณาใส่รหัสผ่าน'],
        minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Store',
        required: [true, 'กรุณาระบุรหัสสาขา/ร้านค้าที่ผู้ใช้งานสังกัด']
    },
    phone: {
        type: String,
        default: '' 
    },
    // 🆕 เพิ่มฟิลด์นี้เข้าไปครับ
    profile_image: {
        type: String,
        default: ''
    }
}, 
{ 
    timestamps: true 
});

const User = mongoose.model('User', UserSchema);

export default User;