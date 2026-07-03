import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

let dbMode = 'File';

// File DB Helpers (Note: Local file storage is not persistent on Vercel)
const DB_PATH = path.join(process.cwd(), 'server', 'db.json');
const readDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        const initial = { materials: [], students: [] };
        return initial;
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH));
    } catch (e) {
        return { materials: [], students: [] };
    }
};
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Vercel File System is read-only. Persistent changes require Supabase.");
    }
};

// Initialize Supabase Client if keys are present (Synchronously for serverless compatibility)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    try {
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        dbMode = 'Supabase';
        console.log('✅ Supabase Client initialized successfully (Database Mode: Supabase)');
    } catch (err) {
        console.log('⚠️ Supabase client initialization failed. Switching to Local File Database:', err.message);
        dbMode = 'File';
    }
} else {
    console.log('⚠️ Supabase credentials missing (SUPABASE_URL / SUPABASE_KEY). Local File Database active.');
    dbMode = 'File';
}

// Database Mappings to preserve original Frontend schemas
const mapMaterial = (m) => ({
    _id: m.id,
    title: m.title,
    language: m.language,
    speed: m.speed,
    text: m.text,
    audioPath: m.audio_path || '',
    createdAt: m.created_at || new Date(),
    duration: m.duration || 0
});

const mapStudent = (s) => ({
    _id: s.id,
    email: s.email,
    password: s.password,
    access: s.access || [],
    createdAt: s.created_at || new Date()
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

// Routes
app.get('/api/status', (req, res) => res.json({ mode: dbMode }));

// Use Memory Storage for Multer to easily switch between Supabase Storage & disk fallback
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/materials/upload-url', async (req, res) => {
    const { filename, contentType } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    try {
        if (dbMode === 'Supabase') {
            const filePath = `uploads/${Date.now()}_${filename}`;
            const { data, error } = await supabase.storage
                .from('audio-materials')
                .createSignedUploadUrl(filePath);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('audio-materials')
                .getPublicUrl(filePath);

            res.json({
                signedUrl: data.signedUrl,
                publicUrl: publicUrl,
                path: filePath
            });
        } else {
            const localFilename = `${Date.now()}_${filename}`;
            res.json({
                localMode: true,
                filename: localFilename,
                publicUrl: `/uploads/${localFilename}`
            });
        }
    } catch (e) {
        console.error("Error generating signed upload URL:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/materials', upload.single('audio'), async (req, res) => {
    const { title, language, speed, text, audioPath: directAudioPath, duration } = req.body;
    let audioPath = directAudioPath || '';
    const durationVal = duration ? parseInt(duration, 10) : 0;

    try {
        if (dbMode === 'Supabase') {
            if (!audioPath && req.file) {
                const filename = `uploads/${Date.now()}_${req.file.originalname}`;
                const { data: storageData, error: storageError } = await supabase.storage
                    .from('audio-materials')
                    .upload(filename, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert: true
                    });

                if (storageError) throw storageError;

                const { data: { publicUrl } } = supabase.storage
                    .from('audio-materials')
                    .getPublicUrl(filename);
                
                audioPath = publicUrl;
            }

            const { data, error } = await supabase.from('materials').insert([{
                title,
                language,
                speed,
                text,
                audio_path: audioPath,
                duration: durationVal
            }]).select();

            if (error) throw error;
            res.status(201).json(mapMaterial(data[0]));
        } else {
            // Local File Fallback (ephemeral on Vercel)
            if (req.file) {
                const filename = Date.now() + path.extname(req.file.originalname);
                const uploadDir = path.join(process.cwd(), 'server', 'uploads');
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
                audioPath = `/uploads/${filename}`;
            }

            const db = readDB();
            const m = { 
                _id: uuidv4(), 
                title, 
                language, 
                speed, 
                text, 
                audioPath, 
                duration: durationVal,
                createdAt: new Date() 
            };
            db.materials.push(m);
            writeDB(db);
            res.status(201).json(m);
        }
    } catch (e) {
        console.error("Error creating material:", e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/materials', async (req, res) => {
    try {
        if (dbMode === 'Supabase') {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data.map(mapMaterial));
        } else {
            const db = readDB();
            res.json(db.materials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
    } catch (e) {
        console.error("Error fetching materials:", e);
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/materials/:id', async (req, res) => {
    try {
        if (dbMode === 'Supabase') {
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;
        } else {
            const db = readDB();
            db.materials = db.materials.filter(m => m._id !== req.params.id);
            writeDB(db);
        }
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error("Error deleting material:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/students', async (req, res) => {
    const { email, password, access } = req.body;

    try {
        if (dbMode === 'Supabase') {
            const { data, error } = await supabase.from('students').insert([{
                email,
                password,
                access: access || ['English', 'Marathi']
            }]).select();

            if (error) {
                if (error.code === '23505') {
                    return res.status(400).json({ error: 'Student with this email already exists' });
                }
                throw error;
            }
            res.status(201).json(mapStudent(data[0]));
        } else {
            const db = readDB();
            if (db.students.some(s => s.email === email)) {
                return res.status(400).json({ error: 'Student with this email already exists' });
            }

            const s = { 
                _id: uuidv4(), 
                email, 
                password, 
                access: access || ['English', 'Marathi'], 
                createdAt: new Date() 
            };
            db.students.push(s);
            writeDB(db);
            res.status(201).json(s);
        }
    } catch (e) {
        console.error("Error creating student:", e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/students', async (req, res) => {
    try {
        if (dbMode === 'Supabase') {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data.map(mapStudent));
        } else {
            const db = readDB();
            res.json(db.students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
    } catch (e) {
        console.error("Error fetching students:", e);
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        if (dbMode === 'Supabase') {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;
        } else {
            const db = readDB();
            db.students = db.students.filter(s => s._id !== req.params.id);
            writeDB(db);
        }
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error("Error deleting student:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === 'rohanselukar@gmail.com' && password === 'Rohan@7841999297') {
        return res.json({ role: 'admin', email });
    }
    
    try {
        let student;
        if (dbMode === 'Supabase') {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .maybeSingle();

            if (error) throw error;
            student = data ? mapStudent(data) : null;
        } else {
            const db = readDB();
            student = db.students.find(s => s.email === email && s.password === password);
        }

        if (student) {
            res.json({ role: 'student', email: student.email, access: student.access });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e) {
        console.error("Error checking login:", e);
        res.status(500).json({ error: e.message });
    }
});

export default app;
