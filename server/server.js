import express from 'express';
import mongoose from 'mongoose';
import process from 'process'; 
import cors from 'cors';

import Product from './models/products.js'; 
import User from './models/users.js';    
import Store from './models/stores.js';  
import Category from './models/categorys.js';
import Sale from './models/sales.js'; 
import jwt from 'jsonwebtoken';          
import bcrypt from 'bcryptjs';           

import multer from 'multer'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'YOUR_SECRET_KEY'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = 'mongodb+srv://Cluster40353:pbl1com31@cluster40353.jwnefyf.mongodb.net/shopassistant_db';

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
        if (mimetype && extname) return cb(null, true);
        cb(new Error('File upload only supports JPEG, JPG, PNG, GIF files.'));
    }
});

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
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
};

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
    const { store_name, username, email, password } = req.body;
    try {
        let store = await Store.findOne({ store_name });
        if (store) return res.status(400).json({ message: 'ชื่อร้านค้านี้ถูกลงทะเบียนแล้ว' });
        store = await Store.create({ store_name, location: 'Initial Location' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ username, email, password: hashedPassword, store_id: store._id });
        const token = jwt.sign({ user_id: user._id, store_id: user.store_id }, JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ message: 'ลงทะเบียนสำเร็จ', data: { user_id: user._id, username: user.username, store_id: user.store_id, token } });
    } catch (error) {
        res.status(500).json({ message: 'การลงทะเบียนล้มเหลว', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'ชื่อผู้ใช้ไม่ถูกต้อง' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        const token = jwt.sign({ user_id: user._id, store_id: user.store_id }, JWT_SECRET, { expiresIn: '30d' });
        const store = await Store.findById(user.store_id);
        res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ', data: { user_id: user._id, username: user.username, store_id: user.store_id, store_name: store ? store.store_name : 'N/A', token } });
    } catch (error) {
        res.status(500).json({ message: 'ล้มเหลว', error: error.message });
    }
});

// --- CATEGORIES ---
app.get('/api/categories', protect, async (req, res) => {
    try {
        const categories = await Category.find({ store_id: req.storeId }).sort({ name: 1 });

        const categoriesWithStats = await Promise.all(
            categories.map(async (cat) => {
                const productIds = await Product.find({ category: cat._id, store_id: req.storeId }).distinct('_id');

                const productCount = productIds.length;

                const sales = await Sale.find({
                    store_id: req.storeId,
                    'items.product_id': { $in: productIds }
                });

                let totalRevenue = 0;
                let totalCost = 0;

                sales.forEach(sale => {
                sale.items
                    .filter(i => productIds.some(pid => pid.equals(i.product_id)))
                    .forEach(i => {
                    totalRevenue += i.quantity * i.price_at_sale;
                    totalCost += i.quantity * i.cost_at_sale;
                    });
                });

                const totalProfit = totalRevenue - totalCost;
                const totalExpense = totalCost;

                return {
                ...cat.toObject(),
                productCount,
                totalRevenue,
                totalProfit,
                totalExpense
                };
            })
        );

        res.status(200).json({ success: true, data: categoriesWithStats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/categories', protect, async (req, res) => {
    const { name } = req.body;
    try {
        const newCategory = await Category.create({ name: name.trim(), store_id: req.storeId });
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/categories/:id', protect, async (req, res) => {
    try {
        await Category.findOneAndDelete({ _id: req.params.id, store_id: req.storeId });
        await Product.updateMany({ category: req.params.id, store_id: req.storeId }, { $unset: { category: "" } });
        res.status(200).json({ success: true, message: 'ลบเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- PRODUCTS ---
app.post('/api/products/restock/:id', protect, async (req, res) => { 
    const { amount } = req.body;
    try {
        const updatedProduct = await Product.findOneAndUpdate({ _id: req.params.id, store_id: req.storeId }, { $inc: { stock: parseInt(amount, 10) } }, { new: true });
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/products/permanent/:id', protect, async (req, res) => { 
    try {
        await Product.findOneAndDelete({ _id: req.params.id, store_id: req.storeId });
        res.status(204).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/products', protect, upload.single('image'), async (req, res) => { 
    try {
        const imageName = req.file ? req.file.filename : 'default-image.jpg';
        const newProduct = await Product.create({ ...req.body, image: imageName, store_id: req.storeId });
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/products', protect, async (req, res) => { 
    try {
        const products = await Product.find({ store_id: req.storeId }).populate('category', 'name'); 
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/products/:id', protect, async (req, res) => { 
    try {
        const product = await Product.findOne({ _id: req.params.id, store_id: req.storeId }).populate('category', 'name'); 
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/products/:id', protect, upload.single('image'), async (req, res) => { 
    try {
        const imageName = req.file ? req.file.filename : req.body.image; 
        const product = await Product.findOneAndUpdate({ _id: req.params.id, store_id: req.storeId }, { $set: { ...req.body, image: imageName } }, { new: true }).populate('category', 'name');
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// --- CHECKOUT ---
app.post('/api/checkout', protect, async (req, res) => { 
    const { items } = req.body;
    try {
        let totalIncome = 0; let totalProfit = 0;
        for (const item of items) {
            const income = (item.price || 0) * (item.quantity || 0);
            const profit = ((item.price || 0) - (item.cost || 0)) * (item.quantity || 0);
            totalIncome += income; totalProfit += profit;
            await Product.findOneAndUpdate({ _id: item.productId, store_id: req.storeId }, { $inc: { stock: -(item.quantity || 0), sold_count: (item.quantity || 0) } });
        }
        await Sale.create({
            store_id: req.storeId,
            sale_date: new Date(),   // ⭐ ต้องเพิ่มบรรทัดนี้
            items: items.map(i => ({
                product_id: i.productId,
                quantity: i.quantity,
                price_at_sale: i.price,
                cost_at_sale: i.cost
            })),
            total_income: totalIncome,
            total_profit: totalProfit
        });
        res.status(200).json({ success: true, message: 'สำเร็จ' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- SETTINGS & PROFILE ---
app.put('/api/settings/profile', protect, async (req, res) => {
    try {
        if (req.body.store_name) await Store.findByIdAndUpdate(req.storeId, { store_name: req.body.store_name });
        await User.findByIdAndUpdate(req.userId, { email: req.body.email, phone: req.body.phone });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/settings/profile-image', protect, upload.single('image'), async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, { profile_image: req.file.filename });
        res.status(200).json({ success: true, image: req.file.filename });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/settings/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const store = await Store.findById(req.storeId);
        res.status(200).json({ success: true, data: { store_name: store.store_name, email: user.email, username: user.username, phone: user.phone || '', profile_image: user.profile_image || '' } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/store/info', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const store = await Store.findById(req.storeId);
        res.json({ success: true, data: { storeName: store.store_name, email: user.email, phoneNumber: user.phone || 'N/A' } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- ANALYTICS SECTION (RE-INTEGRATED & ENHANCED) ---
app.get('/api/analytics', protect, async (req, res) => {
    try {
        const { type, productId, categoryId, period = 'overall' } = req.query;

        const now = new Date();
        let startDate, endDate, groupBy;

        if (period === 'daily') {
            // รายวัน (ภายในเดือนนี้)
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = { $dayOfMonth: "$sale_date" };
        } 
        else if (period === 'monthly') {
            // รายเดือน (ภายในปีนี้)
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            groupBy = { $month: "$sale_date" };
        } 
        else {
            // overall
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

            if (type === 'product') {
                groupBy = "$product_id";
            } 
            else if (type === 'category') {
                groupBy = "$category_id";
            } 
            else {
                // overall + overall → รวมยอดทั้งร้าน
                groupBy = { $month: "$sale_date" };
            }
        }

        let matchStage = { 
            store_id: new mongoose.Types.ObjectId(req.storeId), 
            sale_date: { $gte: startDate, $lte: endDate } 
        };

        let pipeline = [{ $match: matchStage }];

        if ((type === 'product' || type === 'product_compare') && productId) {
            pipeline.push(
                { $unwind: "$items" },
                { $match: { "items.product_id": new mongoose.Types.ObjectId(productId) } },
                { $group: { 
                    _id: groupBy, 
                    income: { $sum: { $multiply: ["$items.quantity", "$items.price_at_sale"] } },
                    profit: { $sum: { $multiply: ["$items.quantity", { $subtract: ["$items.price_at_sale", "$items.cost_at_sale"] }] } },
                    expense: { $sum: { $multiply: ["$items.quantity", "$items.cost_at_sale"] } }
                }}
            );
        }
        else if ((type === 'category' || type === 'category_compare') && categoryId) {
            pipeline.push(
                { $unwind: "$items" },
                { $lookup: { from: "products", localField: "items.product_id", foreignField: "_id", as: "prodInfo" } },
                { $unwind: "$prodInfo" },
                { 
                    $match: { 
                        "prodInfo.category": new mongoose.Types.ObjectId(categoryId),
                        "prodInfo.store_id": new mongoose.Types.ObjectId(req.storeId)
                    } 
                },
                { $group: { 
                    _id: groupBy, 
                    income: { $sum: { $multiply: ["$items.quantity", "$items.price_at_sale"] } },
                    profit: { $sum: { $multiply: ["$items.quantity", { $subtract: ["$items.price_at_sale", "$items.cost_at_sale"] }] } },
                    expense: { $sum: { $multiply: ["$items.quantity", "$items.cost_at_sale"] } }
                }}
            );
        }

        else if (period === 'overall' && type === 'product' && !productId) {
            const products = await Product.find({ store_id: req.storeId });

            const income = [];
            const profit = [];
            const expense = [];

            for (const p of products) {
                const stats = await Sale.aggregate([
                    { $match: { store_id: new mongoose.Types.ObjectId(req.storeId) } },
                    { $unwind: "$items" },
                    { $match: { "items.product_id": p._id } },
                    {
                        $group: {
                            _id: null,
                            totalIncome: {
                                $sum: { $multiply: ["$items.quantity", "$items.price_at_sale"] }
                            },
                            totalCost: {
                                $sum: { $multiply: ["$items.quantity", "$items.cost_at_sale"] }
                            }
                        }
                    }
                ]);

                const totalIncome = stats[0]?.totalIncome || 0;
                const totalCost = stats[0]?.totalCost || 0;

                income.push(totalIncome);
                expense.push(totalCost);
                profit.push(totalIncome - totalCost);
            }

            return res.json({
                success: true,
                totals: {
                    income: income.reduce((a, b) => a + b, 0),
                    expense: expense.reduce((a, b) => a + b, 0),
                    profit: profit.reduce((a, b) => a + b, 0),
                },
                data: { income, profit, expense }
            });
        }
        else if (!type || type === 'overall') {
            pipeline.push({ 
                $group: { 
                    _id: groupBy, 
                    income: { $sum: "$total_income" }, 
                    profit: { $sum: "$total_profit" },
                    expense: { $sum: { $subtract: ["$total_income", "$total_profit"] } }
                } 
            });
        }
        else {
            pipeline.push({ 
                $group: { 
                    _id: groupBy, 
                    income: { $sum: "$total_income" }, 
                    profit: { $sum: "$total_profit" },
                    expense: { $sum: { $subtract: ["$total_income", "$total_profit"] } }
                } 
            });
        }

        const stats = await Sale.aggregate([...pipeline, { $sort: { "_id": 1 } }]);

        let size = period === 'daily'
            ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
            : 12;

        const incomeData = new Array(size).fill(0);
        const profitData = new Array(size).fill(0);
        const expenseData = new Array(size).fill(0);

        stats.forEach(item => {
            const index = item._id - 1;
            if (index >= 0 && index < size) {
                incomeData[index] = item.income;
                profitData[index] = item.profit;
                expenseData[index] = item.expense || Math.max(0, item.income - item.profit);
            }
        });

        res.json({ 
            success: true, 
            totals: { 
                income: incomeData.reduce((a, b) => a + b, 0), 
                profit: profitData.reduce((a, b) => a + b, 0), 
                expense: expenseData.reduce((a, b) => a + b, 0) 
            }, 
            data: { income: incomeData, profit: profitData, expense: expenseData } 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analytics/daily', protect, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const stats = await Sale.aggregate([
            { $match: { store_id: new mongoose.Types.ObjectId(req.storeId), sale_date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: { $dayOfMonth: "$sale_date" }, income: { $sum: "$total_income" }, profit: { $sum: "$total_profit" } } },
            { $sort: { "_id": 1 } }
        ]);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analytics/products', protect, async (req, res) => {
    try {
        const stats = await Sale.aggregate([
            { $match: { store_id: new mongoose.Types.ObjectId(req.storeId) } },
            { $unwind: "$items" },
            { $group: { _id: "$items.product_id", total_qty: { $sum: "$items.quantity" }, total_income: { $sum: { $multiply: ["$items.quantity", "$items.price_at_sale"] } } } },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "p" } },
            { $unwind: "$p" },
            { $project: { name: "$p.product_name", quantity: "$total_qty", income: "$total_income" } },
            { $sort: { quantity: -1 } }, { $limit: 10 }
        ]);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analytics/categories', protect, async (req, res) => {
    try {
        const stats = await Sale.aggregate([
            { $match: { store_id: new mongoose.Types.ObjectId(req.storeId) } },
            { $unwind: "$items" },
            { $lookup: { from: "products", localField: "items.product_id", foreignField: "_id", as: "prod" } },
            { $unwind: "$prod" },
            { $group: { _id: "$prod.category", income: { $sum: { $multiply: ["$items.quantity", "$items.price_at_sale"] } } } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
            { $unwind: "$cat" },
            { $project: { name: "$cat.name", income: 1 } }
        ]);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

connectDB();
app.get('/', (req, res) => res.send('Server is running!'));
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));