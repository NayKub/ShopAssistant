// server.js (รวม API Products และ Category)

import express from 'express';
import mongoose from 'mongoose';
import process from 'process'; 
import cors from 'cors';

// 🔑 IMPORT MODELS และ JWT
import Product from './models/products.js'; 
import User from './models/users.js';    
import Store from './models/stores.js';  
import Category from './models/categorys.js'; // 🆕 IMPORT Category Model
import jwt from 'jsonwebtoken';          
import bcrypt from 'bcryptjs';           

// 🚀 Import Multer และโมดูลที่จำเป็นสำหรับไฟล์
import multer from 'multer'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'YOUR_SECRET_KEY'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = 'mongodb+srv://Cluster40353:pbl1com31@cluster40353.jwnefyf.mongodb.net/shopassistant_db';

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads/')); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('File upload only supports JPEG, JPG, PNG, GIF files.'));
    }
}).single('image');

// --- Middleware Setting ---
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected successfully!');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1); 
    }
};

// ----------------------------------------------------------------
// 🔑 Middleware: ตรวจสอบ JWT และดึง store_id
// ----------------------------------------------------------------

const protect = (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            
            req.storeId = decoded.store_id; 
            req.userId = decoded.user_id;

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// ----------------------------------------------------------------
// 🔑 API: Auth (Register & Login)
// ----------------------------------------------------------------

// POST /api/auth/register - ลงทะเบียนร้านค้าและผู้ใช้งานหลัก
app.post('/api/auth/register', async (req, res) => {
    const { store_name, username, email, password } = req.body;

    if (!store_name || !username || !email || !password) {
        return res.status(400).json({ message: 'กรุณาใส่ข้อมูลให้ครบทุกช่อง' });
    }

    try {
        let store = await Store.findOne({ store_name });
        
        if (store) {
            return res.status(400).json({ message: 'ชื่อร้านค้านี้ถูกลงทะเบียนแล้ว' });
        }

        store = await Store.create({ store_name, location: 'Initial Location' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            store_id: store._id 
        });

        const token = jwt.sign(
            { user_id: user._id, store_id: user.store_id }, 
            JWT_SECRET, 
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'ลงทะเบียนร้านค้าและผู้ใช้สำเร็จ',
            data: {
                user_id: user._id,
                username: user.username,
                store_id: user.store_id,
                token
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'การลงทะเบียนล้มเหลว',
            error: error.message 
        });
    }
});

// POST /api/auth/login - เข้าสู่ระบบ
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้ไม่ถูกต้อง' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign(
            { user_id: user._id, store_id: user.store_id }, 
            JWT_SECRET, 
            { expiresIn: '30d' }
        );
        
        const store = await Store.findById(user.store_id);

        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            data: {
                user_id: user._id,
                username: user.username,
                store_id: user.store_id,
                store_name: store ? store.store_name : 'N/A',
                token
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'การเข้าสู่ระบบล้มเหลว',
            error: error.message 
        });
    }
});

// ----------------------------------------------------------------
// 🆕 NEW API: Category Management
// ----------------------------------------------------------------

// GET /api/categories - ดึง Category ทั้งหมดของ Store
app.get('/api/categories', protect, async (req, res) => {
    try {
        // กรองตาม store_id ที่ได้จาก JWT
        const categories = await Category.find({ store_id: req.storeId }).sort({ name: 1 });
        res.status(200).json({ 
            success: true, 
            count: categories.length, 
            data: categories 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'ไม่สามารถดึงข้อมูล Category ได้' 
        });
    }
});

// POST /api/categories - สร้าง Category ใหม่
app.post('/api/categories', protect, async (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อ Category ที่ถูกต้อง' });
    }

    try {
        // ตรวจสอบ Unique Index (name + store_id)
        const newCategory = await Category.create({
            name: name.trim(),
            store_id: req.storeId,
        });
        
        res.status(201).json({
            success: true,
            data: newCategory,
            message: 'Category ถูกสร้างเรียบร้อยแล้ว'
        });

    } catch (error) {
        // Mongoose Duplicate Key Error (Code 11000)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Category นี้มีอยู่แล้วในร้านของคุณ' });
        }
        res.status(400).json({
            success: false,
            error: error.message || 'เกิดข้อผิดพลาดในการสร้าง Category'
        });
    }
});

// DELETE /api/categories/:id - ลบ Category
app.delete('/api/categories/:id', protect, async (req, res) => {
    try {
        // ตรวจสอบว่ามี Category นี้และเป็นของร้านตัวเองจริงไหม
        const category = await Category.findOneAndDelete({ 
            _id: req.params.id, 
            store_id: req.storeId 
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'ไม่พบ Category ที่ต้องการลบ' });
        }

        // 💡 เพิ่มเติม: คุณอาจจะอยากเช็คก่อนลบว่ามีสินค้าไหนใช้ Category นี้อยู่ไหม
        // เพื่อป้องกันปัญหาข้อมูลหลุดลอย (Orphaned Data)
        await Product.updateMany(
            { category: req.params.id, store_id: req.storeId },
            { $unset: { category: "" } } // หรือเซ็ตเป็น null
        );

        res.status(200).json({ success: true, message: 'ลบ Category เรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// ----------------------------------------------------------------
// 🚀 API Endpoints: Products (Updated for Category ID)
// ----------------------------------------------------------------

// 🆕 NEW API: POST /api/products/restock/:id - เพิ่ม Stock จริงใน Database
app.post('/api/products/restock/:id', protect, async (req, res) => { 
    const { amount } = req.body;
    const productId = req.params.id;
    const restockAmount = parseInt(amount, 10);

    if (isNaN(restockAmount) || restockAmount <= 0) {
        return res.status(400).json({ success: false, message: 'จำนวนเติม Stock ไม่ถูกต้อง' });
    }

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, store_id: req.storeId }, 
            { $inc: { stock: restockAmount } },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'ไม่พบสินค้าในสาขาของคุณ หรือคุณไม่มีสิทธิ์' });
        }

        res.status(200).json({ 
            success: true, 
            data: updatedProduct, 
            message: `เติม Stock สำเร็จ: เพิ่ม ${restockAmount} ชิ้น` 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดในการเติม Stock',
            error: error.message 
        });
    }
});


// 🆕 NEW API: DELETE /api/products/permanent/:id - ลบสินค้าออกจาก Database ถาวร
app.delete('/api/products/permanent/:id', protect, async (req, res) => { 
    try {
        const product = await Product.findOneAndDelete({ 
            _id: req.params.id, 
            store_id: req.storeId 
        });

        if (!product) {
            return res.status(404).json({ success: false, error: 'ไม่พบสินค้าในสาขาของคุณที่ต้องการลบ' });
        }

        res.status(204).json({ success: true, data: {}, message: 'สินค้าถูกลบอย่างถาวรแล้ว' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});


// POST /api/checkout - ยืนยันการขาย (เพิ่ม sold_count เท่านั้น, Stock คงที่)
app.post('/api/checkout', protect, async (req, res) => { 
    const { items } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'ไม่มีรายการสินค้าในคำสั่งซื้อ' });
    }

    try {
        const updates = items.map(async (item) => {
            const { productId, quantity } = item;
            
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productId, store_id: req.storeId },
                { $inc: { sold_count: quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                throw new Error(`ไม่พบสินค้า ID: ${productId} ในสาขาของคุณ หรือมีปัญหาในการอัปเดต`); 
            }
            
            return updatedProduct;
        });

        await Promise.all(updates);

        res.status(200).json({ 
            success: true, 
            message: 'รายการขายสำเร็จ Sold Count ได้รับการอัปเดตแล้ว' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดในการทำรายการขาย',
            error: error.message 
        });
    }
});

// ----------------------------------------------------------------
// POST /api/products - Create a new product (รองรับ File Upload)
app.post('/api/products', protect, (req, res) => { 
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        try {
            const imageName = req.file ? req.file.filename : 'default-image.jpg';

            const dataToSave = {
                ...req.body,
                image: imageName,
                store_id: req.storeId, 
                // 💡 category ใน req.body ควรเป็น ObjectId ของ Category ที่เลือก
            };
            
            const newProduct = await Product.create(dataToSave);
            
            res.status(201).json({
                success: true,
                data: newProduct,
                message: 'สินค้าถูกบันทึกเรียบร้อยแล้ว'
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });
});

// GET /api/products (ดึงข้อมูลทั้งหมด)
app.get('/api/products', protect, async (req, res) => { 
    try {
        // 🔑 เพิ่ม .populate('category', 'name') เพื่อดึงชื่อ Category มาแสดงผล
        const products = await Product.find({ store_id: req.storeId })
            .populate('category', 'name'); 
            
        res.status(200).json({ 
            success: true, 
            count: products.length, 
            data: products 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'ไม่สามารถดึงข้อมูลสินค้าได้' 
        });
    }
});

// GET /api/products/:id (ดึงข้อมูลสินค้าเดียว)
app.get('/api/products/:id', protect, async (req, res) => { 
    try {
        // 🔑 เพิ่ม .populate('category', 'name')
        const product = await Product.findOne({ _id: req.params.id, store_id: req.storeId })
            .populate('category', 'name'); 
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'ไม่พบสินค้าที่ต้องการแก้ไขในสาขาของคุณ' });
        }
        
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/products/:id - Update product by ID (รองรับ File Upload)
app.put('/api/products/:id', protect, (req, res) => { 
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        
        try {
            const imageName = req.file ? req.file.filename : req.body.image; 
            
            const dataToUpdate = {
                ...req.body,
                image: imageName,
            };
            
            delete dataToUpdate.store_id; 

            const product = await Product.findOneAndUpdate(
                { _id: req.params.id, store_id: req.storeId }, 
                dataToUpdate, 
                { new: true, runValidators: true }
            );

            if (!product) {
                return res.status(404).json({ success: false, error: 'ไม่พบสินค้าที่ต้องการแก้ไขในสาขาของคุณ' });
            }

            // ถ้าอัปเดตสำเร็จ อาจจะต้อง Populate เพื่อส่งข้อมูล Category ที่ถูกต้องกลับไป
            const updatedProductWithCategory = await Product.findById(product._id).populate('category', 'name');

            res.status(200).json({ 
                success: true, 
                data: updatedProductWithCategory, 
                message: 'สินค้าถูกอัปเดตเรียบร้อยแล้ว' 
            });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    });
});

connectDB();

app.get('/', (req, res) => {
    res.send('Server is running and connected to MongoDB!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});