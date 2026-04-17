const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

let dbMode = 'Atlas';

// File DB Helpers
const DB_PATH = path.join(__dirname, 'db.json');
const readDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        const initial = { materials: [], students: [] };
        fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
        return initial;
    }
    return JSON.parse(fs.readFileSync(DB_PATH));
};
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// DB Connection Logic with Fallback
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
      dbMode = 'Atlas';
  })
  .catch(err => {
      console.log('⚠️ Atlas connection blocked by network. Switching to Local File Database.');
      dbMode = 'File';
  });

// Models
const MaterialSchema = new mongoose.Schema({
    title: String, language: String, speed: String, text: String, audioPath: String, createdAt: { type: Date, default: Date.now }
});
const MaterialModel = mongoose.model('Material', MaterialSchema);

const StudentSchema = new mongoose.Schema({
    email: { type: String, unique: true }, password: { type: String }, access: { type: [String], default: ['English', 'Marathi'] }, createdAt: { type: Date, default: Date.now }
});
const StudentModel = mongoose.model('Student', StudentSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/api/status', (req, res) => res.json({ mode: dbMode }));

app.post('/api/materials', multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            cb(null, dir);
        },
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    })
}).single('audio'), async (req, res) => {
    const { title, language, speed, text } = req.body;
    const materialData = { title, language, speed, text, audioPath: req.file ? `/uploads/${req.file.filename}` : '', createdAt: new Date() };

    if (dbMode === 'Atlas') {
        try {
            const m = new MaterialModel(materialData);
            await m.save();
            res.status(201).json(m);
        } catch (e) { res.status(500).json({ error: e.message }); }
    } else {
        const db = readDB();
        const m = { _id: uuidv4(), ...materialData };
        db.materials.push(m);
        writeDB(db);
        res.status(201).json(m);
    }
});

app.get('/api/materials', async (req, res) => {
    if (dbMode === 'Atlas') {
        const m = await MaterialModel.find().sort({ createdAt: -1 });
        res.json(m);
    } else {
        const db = readDB();
        res.json(db.materials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
});

app.delete('/api/materials/:id', async (req, res) => {
    if (dbMode === 'Atlas') {
        await MaterialModel.findByIdAndDelete(req.params.id);
    } else {
        const db = readDB();
        db.materials = db.materials.filter(m => m._id !== req.params.id);
        writeDB(db);
    }
    res.json({ message: 'Deleted' });
});

app.post('/api/students', async (req, res) => {
    const { email, password, access } = req.body;
    const studentData = { email, password, access, createdAt: new Date() };

    if (dbMode === 'Atlas') {
        try {
            const s = new StudentModel(studentData);
            await s.save();
            res.status(201).json(s);
        } catch (e) { res.status(500).json({ error: e.message }); }
    } else {
        const db = readDB();
        const s = { _id: uuidv4(), ...studentData };
        db.students.push(s);
        writeDB(db);
        res.status(201).json(s);
    }
});

app.get('/api/students', async (req, res) => {
    if (dbMode === 'Atlas') {
        const s = await StudentModel.find().sort({ createdAt: -1 });
        res.json(s);
    } else {
        const db = readDB();
        res.json(db.students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
});

app.delete('/api/students/:id', async (req, res) => {
    if (dbMode === 'Atlas') {
        await StudentModel.findByIdAndDelete(req.params.id);
    } else {
        const db = readDB();
        db.students = db.students.filter(s => s._id !== req.params.id);
        writeDB(db);
    }
    res.json({ message: 'Deleted' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === 'rohanselukar@gmail.com' && password === 'Rohan@7841999297') {
        return res.json({ role: 'admin', email });
    }
    
    let student;
    if (dbMode === 'Atlas') {
        student = await StudentModel.findOne({ email, password });
    } else {
        const db = readDB();
        student = db.students.find(s => s.email === email && s.password === password);
    }

    if (student) {
        res.json({ role: 'student', email: student.email, access: student.access });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

module.exports = app;
