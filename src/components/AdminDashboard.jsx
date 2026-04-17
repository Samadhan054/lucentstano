import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, FileAudio, LayoutDashboard, LogOut, Trash2, Save, Upload } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newMaterial, setNewMaterial] = useState({ title: '', language: 'English', speed: '30', text: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [newStudent, setNewStudent] = useState({ email: '', password: '', access: ['English', 'Marathi'] });
  const [isServerUp, setIsServerUp] = useState(true);
  const [dbMode, setDbMode] = useState('Checking...');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const statusRes = await fetch(`${API_BASE.replace('/api', '/api/status')}`);
      const statusData = await statusRes.json();
      setDbMode(statusData.mode);

      const res = await fetch(`${API_BASE}/${activeTab}`);
      if (!res.ok) throw new Error("Server responded with error");
      const data = await res.json();
      if (activeTab === 'materials') setMaterials(data);
      else setStudents(data);
      setIsServerUp(true);
    } catch (e) {
      console.error("Error fetching data:", e);
      setIsServerUp(false);
      setDbMode('Disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!audioFile) return alert("Please select an audio file");
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', newMaterial.title);
    formData.append('language', newMaterial.language);
    formData.append('speed', newMaterial.speed);
    formData.append('text', newMaterial.text);
    formData.append('audio', audioFile);

    try {
      const res = await fetch(`${API_BASE}/materials`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Material added and uploaded successfully!');
        setNewMaterial({ title: '', language: 'English', speed: '30', text: '' });
        setAudioFile(null);
        fetchData();
      } else {
        const data = await res.json();
        alert('Failed to save: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert('Network Error: Make sure the server is running on Port 5000');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        alert('Student added successfully!');
        setNewStudent({ email: '', password: '' });
        fetchData();
      }
    } catch (e) {
      console.error("Error adding student:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id, type) => {
    const endpoint = type === 'material' ? 'materials' : 'students';
    try {
      await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  return (
    <div className="min-h-screen gradient-bg text-white flex">
      {/* Sidebar - Same as before */}
      <div className="w-72 glass border-r border-white/5 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>

        <nav className="space-y-4 flex-1">
          <button 
            onClick={() => setActiveTab('materials')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'materials' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <FileAudio size={20} /> Material MGMT
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Users size={20} /> Students
          </button>
        </nav>

        <button onClick={onLogout} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all mt-auto">
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-bold mb-2">
            System Dashboard 
            <span className={`text-sm font-bold ml-4 px-3 py-1 rounded-full ${isServerUp ? (dbMode === 'Atlas' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400') : 'bg-red-500/20 text-red-400'}`}>
              {isServerUp ? `● Online [Mode: ${dbMode}]` : '● Backend Disconnected'}
            </span>
          </h2>
          {isServerUp && dbMode === 'File' && <p className="text-emerald-400 mt-2 text-sm font-medium">✨ Network DNS blocked Atlas. Auto-fell back to Local File DB. You can start working!</p>}
          {!isServerUp && <p className="text-red-400 mt-2 font-bold animate-pulse">Action required: Run "node index.js" in the server folder.</p>}
          <p className="text-slate-400 mt-1">Manage your assets and student access in real-time.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark p-8 rounded-3xl border border-white/5 h-fit">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Plus className="text-indigo-400" /> {activeTab === 'materials' ? 'New Material' : 'New Student'}
            </h3>

            {activeTab === 'materials' ? (
              <form onSubmit={handleAddMaterial} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Title</label>
                  <input required value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="e.g. Speed Practice #1" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Language</label>
                    <select value={newMaterial.language} onChange={e => setNewMaterial({...newMaterial, language: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none">
                      <option>English</option>
                      <option>Marathi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Speed (WPM)</label>
                    <select value={newMaterial.speed} onChange={e => setNewMaterial({...newMaterial, speed: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none">
                      <option>30</option><option>60</option><option>80</option><option>90</option><option>100</option><option>120</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Audio File (Upload)</label>
                  <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-500 transition-all cursor-pointer group">
                     <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                     <Upload className="mx-auto mb-2 text-slate-500 group-hover:text-indigo-400" size={32} />
                     <p className="text-sm text-slate-400">{audioFile ? audioFile.name : 'Click to upload audio file'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Transcription Text</label>
                  <textarea required rows="3" value={newMaterial.text} onChange={e => setNewMaterial({...newMaterial, text: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none" placeholder="Paste the content here..." />
                </div>
                <button disabled={isLoading} className="w-full bg-indigo-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50">
                  {isLoading ? 'Uploading...' : <><Save size={20} /> Upload & Save</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddStudent} className="space-y-6">
                <div className="space-y-2"><label className="text-sm text-slate-400">Email</label><input type="email" required value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none" /></div>
                <div className="space-y-2"><label className="text-sm text-slate-400">Password</label><input required value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none" /></div>
                <div className="space-y-4">
                  <label className="text-sm text-slate-400 block">Section Access</label>
                  <div className="flex gap-4">
                    {['English', 'Marathi'].map(lang => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={newStudent.access.includes(lang)}
                          onChange={(e) => {
                            const newAccess = e.target.checked 
                              ? [...newStudent.access, lang]
                              : newStudent.access.filter(a => a !== lang);
                            setNewStudent({...newStudent, access: newAccess});
                          }}
                          className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm group-hover:text-white transition-colors">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button disabled={isLoading} className="w-full bg-indigo-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50">
                  {isLoading ? 'Creating...' : <><Plus size={20} /> Create Account</>}
                </button>
              </form>
            )}
          </motion.div>

          {/* List Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-dark p-8 rounded-3xl border border-white/5 max-h-[700px] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-8">Current Database</h3>
            <div className="space-y-4">
              {activeTab === 'materials' ? (
                materials.map(m => (
                  <div key={m._id} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/10 transition-all">
                    <div>
                      <h4 className="font-bold">{m.title}</h4>
                      <p className="text-xs text-slate-500">{m.language} | {m.speed} WPM</p>
                    </div>
                    <button onClick={() => deleteItem(m._id, 'material')} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                  </div>
                ))
              ) : (
                students.map(s => (
                  <div key={s._id} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/10 transition-all">
                    <div>
                        <h4 className="font-bold">{s.email}</h4>
                        <div className="flex gap-2 mt-1">
                            {s.access?.map(a => (
                                <span key={a} className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">{a}</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => deleteItem(s._id, 'student')} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
