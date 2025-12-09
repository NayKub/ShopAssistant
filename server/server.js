import express from 'express';
import mongoose from 'mongoose';
import process from 'process'; 
import cors from 'cors';
import Product from './models/products.js';

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = 'mongodb+srv://Cluster40353:pbl1com31@cluster40353.jwnefyf.mongodb.net/shopassistant_db';

app.use(express.json());
app.use(cors());

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected successfully!');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1); 
    }
};

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        
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

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                error: 'ไม่พบสินค้าที่ต้องการแก้ไข' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: product 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true 
        });

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                error: 'ไม่พบสินค้าที่ต้องการแก้ไข' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: product, 
            message: 'สินค้าถูกอัปเดตเรียบร้อยแล้ว' 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});


connectDB();

app.get('/', (req, res) => {
    res.send('Server is running and connected to MongoDB!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});