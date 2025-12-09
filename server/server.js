// server.js (อัปเดตเพื่อรองรับ File Upload ด้วย Multer และ Checkout API)

import express from 'express';
import mongoose from 'mongoose';
import process from 'process'; 
import cors from 'cors';
import Product from './models/products.js'; // Assuming Product model has 'image' field

// 🚀 NEW: Import Multer และโมดูลที่จำเป็นสำหรับไฟล์
import multer from 'multer'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; // สำหรับจัดการ path ใน ES Module

const app = express();
const PORT = process.env.PORT || 3000;

// 🚀 NEW: ตั้งค่า path สำหรับ ES Module
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
    limits: { fileSize: 1024 * 1024 * 5 }, // จำกัดขนาดไฟล์ที่ 5MB
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
// 🚀 API Endpoints ที่ได้รับการอัปเดต
// ----------------------------------------------------------------

// POST /api/checkout - ยืนยันการขาย (เพิ่ม sold_count เท่านั้น, Stock คงที่)
app.post('/api/checkout', async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'ไม่มีรายการสินค้าในคำสั่งซื้อ' });
    }

    try {
        const updates = items.map(async (item) => {
            const { productId, quantity } = item;
            
            // 🚩 FIXED LOGIC: ใช้ $inc เพื่อเพิ่ม sold_count เท่านั้น (ไม่ลด stock)
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                { 
                    $inc: { sold_count: quantity } // ✅ Database จะอัปเดตแค่ sold_count
                },
                { new: true }
            );

            if (!updatedProduct) {
                // หากทำรายการขาย แต่สินค้าหมด Stock ไปก่อน อาจใช้ Logic อื่นๆ เช่น Rollback หรือแจ้งเตือน
                throw new Error(`ไม่พบสินค้า ID: ${productId} หรือมีปัญหาในการอัปเดต`); 
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
app.post('/api/products', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        try {
            const imageName = req.file ? req.file.filename : 'default-image.jpg';

            const dataToSave = {
                ...req.body,
                image: imageName, 
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
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
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
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
        }
        
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/products/:id - Update product by ID (รองรับ File Upload)
app.put('/api/products/:id', (req, res) => {
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

            const product = await Product.findByIdAndUpdate(req.params.id, dataToUpdate, {
                new: true, 
                runValidators: true 
            });

            if (!product) {
                return res.status(404).json({ success: false, error: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
            }

            res.status(200).json({ success: true, data: product, message: 'สินค้าถูกอัปเดตเรียบร้อยแล้ว' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'ไม่พบสินค้าที่ต้องการลบ' });
        }

        res.status(204).json({ success: true, data: {}, message: 'สินค้าถูกลบเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

connectDB();

app.get('/', (req, res) => {
    res.send('Server is running and connected to MongoDB!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});