import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, FastForward, Play, Pause, RotateCcw, Send, AlertTriangle, CheckCircle2, XCircle, Info, ChevronRight, Languages } from 'lucide-react';
import { compareText } from '../utils/textComparison';
import { transliterateSentence } from '../utils/marathiTransliteration';

const StudentDashboard = ({ user, onLogout }) => {
  const [step, setStep] = useState('language'); // language -> speed -> list -> practice -> results
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedSpeed, setSelectedSpeed] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  const [materials, setMaterials] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [lastChar, setLastChar] = useState('');

  const marathiMapping = {
    'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ee': 'ई', 'u': 'उ', 'oo': 'ऊ', 'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ', 'am': 'अं', 'ah': 'अः',
    'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ch': 'च', 'chh': 'छ', 'j': 'ज', 'jh': 'झ', 't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
    'p': 'प', 'ph': 'फ', 'f': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म', 'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 'sh': 'श', 'shh': 'ष', 's': 'स', 'h': 'ह', 'L': 'ळ', 'ksh': 'क्ष', 'dny': 'ज्ञ'
  };
  const [comparisonResult, setComparisonResult] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(err => console.error("Error loading materials:", err));
  }, []);

  const resetAll = () => {
    setStep('language');
    setSelectedLang(null);
    setSelectedSpeed(null);
    setSelectedMaterial(null);
    setIsFinished(false);
    setUserInput('');
    setComparisonResult(null);
  };

  const startPractice = () => {
    setShowWarning(false);
    setStep('practice');
    setIsPlaying(true);
    // In a real app, we'd play the audio. Here we simulate it ends after a bit if URL is just a placeholder, 
    // but we'll use a real audio element.
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setIsFinished(true);
  };

  const handleSubmit = () => {
    const result = compareText(selectedMaterial.text, userInput);
    setComparisonResult(result);
    setStep('results');
  };

  return (
    <div className="min-h-screen gradient-bg text-white p-8">
      {/* Header */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <Languages className="text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">STUDent PORTAL</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-slate-400">Welcome, <span className="text-white font-medium">{user.email}</span></span>
          <button onClick={onLogout} className="glass px-4 py-2 rounded-xl text-sm hover:bg-red-500/10 hover:text-red-400 transition-all">Sign Out</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Language Selection */}
          {step === 'language' && (
            <motion.div 
              key="lang"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-12 py-12"
            >
              <h2 className="text-5xl font-black">Choose Language</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['English', 'Marathi']
                  .filter(lang => !user.access || user.access.includes(lang))
                  .map(lang => (
                  <motion.button
                    key={lang}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedLang(lang); setStep('speed'); }}
                    className="glass-dark p-12 rounded-[2rem] border border-white/5 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{lang === 'English' ? '🇬🇧' : '🇮🇳'}</div>
                    <h3 className="text-3xl font-bold">{lang}</h3>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Speed Selection */}
          {step === 'speed' && (
            <motion.div 
              key="speed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button onClick={() => setStep('language')} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
                 ← Back to Language
              </button>
              <h2 className="text-4xl font-bold text-center">Select Difficulty (WPM)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {['30', '60', '80', '90', '100', '120'].map(speed => (
                  <button
                    key={speed}
                    onClick={() => { setSelectedSpeed(speed); setStep('list'); }}
                    className="glass p-8 rounded-2xl hover:bg-indigo-500 transition-all font-bold text-2xl"
                  >
                    {speed} WPM
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Material List */}
          {step === 'list' && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <button onClick={() => setStep('speed')} className="text-slate-400 hover:text-white flex items-center gap-2">
                 ← Back to Speeds
              </button>
              <h2 className="text-4xl font-bold">Materials for {selectedLang} @ {selectedSpeed} WPM</h2>
              <div className="space-y-4">
                {materials
                  .filter(m => m.language === selectedLang && m.speed === selectedSpeed)
                  .map(material => (
                    <div 
                      key={material._id}
                      className="glass-dark p-6 rounded-2xl flex justify-between items-center group border border-white/5"
                    >
                      <div>
                        <h4 className="text-xl font-bold mb-1">{material.title}</h4>
                        <p className="text-slate-400 text-sm">Category: Shorthand Dictation</p>
                      </div>
                      <button 
                        onClick={() => { setSelectedMaterial(material); setShowWarning(true); }}
                        className="bg-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2"
                      >
                        Select <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                {materials.filter(m => m.language === selectedLang && m.speed === selectedSpeed).length === 0 && (
                  <div className="glass p-12 rounded-2xl text-center">
                    <Info className="mx-auto mb-4 text-slate-500" size={48} />
                    <p className="text-slate-400 text-lg">No materials found for this selection.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Practice Mode */}
          {step === 'practice' && (
            <motion.div 
              key="practice"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="glass-dark p-8 rounded-[2rem] border border-white/5 text-center relative overflow-hidden">
                {!isFinished ? (
                   <>
                    <h3 className="text-2xl font-bold mb-4">Listening Mode: {selectedMaterial.title}</h3>
                    <div className="flex justify-center gap-8 items-center mb-8">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-indigo-600/20 text-indigo-400 ${isPlaying ? 'animate-pulse' : ''}`}>
                        <Play size={40} />
                      </div>
                    </div>
                    <audio 
                      ref={audioRef} 
                      src={selectedMaterial.audioPath} 
                      autoPlay 
                      onEnded={handleAudioEnd}
                      className="hidden"
                    />
                    <p className="text-indigo-400 font-medium animate-bounce italic">Listen carefully and visualize the strokes...</p>
                   </>
                ) : isFinished === true ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-3xl font-black">Audio Completed</h3>
                    <p className="text-slate-400">The dictation has ended. Click below to start your transcription practice.</p>
                    <button 
                      onClick={() => setIsFinished('writing')}
                      className="bg-indigo-600 px-10 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg"
                    >
                      Start Practice
                    </button>
                  </div>
                ) : (
                  <div className="py-12">
                     <h3 className="text-2xl font-bold text-indigo-400">Practice Mode Active</h3>
                     <p className="text-slate-400 mt-2">Submit your work when finished</p>
                  </div>
                )}
              </div>

              {isFinished === 'writing' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-2 px-2">
                    <label className="text-lg font-bold">Transcription Area</label>
                    <span className="text-slate-400 text-sm">{userInput.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    rows="10"
                    value={userInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (selectedLang === 'Marathi') {
                        // Real-time phonetic transliteration on space
                        if (val.endsWith(' ')) {
                           setUserInput(transliterateSentence(val));
                        } else {
                           setUserInput(val);
                        }
                      } else {
                        setUserInput(val);
                      }
                    }}
                    className="w-full glass-dark border border-white/10 rounded-2xl p-8 text-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all leading-relaxed"
                    style={{ fontFamily: selectedLang === 'Marathi' ? "'Noto Sans Devanagari', sans-serif" : "inherit" }}
                    placeholder={selectedLang === 'Marathi' ? "येथे मराठीत टाइप करा..." : "Start typing the paragraph here..."}
                  />
                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-5 rounded-2xl font-black text-xl hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3"
                  >
                    <Send /> Submit for Verdict
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 5: Results */}
          {step === 'results' && comparisonResult && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="glass-dark p-12 rounded-[3rem] border border-white/5 text-center shadow-2xl overflow-hidden relative">
                {/* Result Background Effect */}
                <div className={`absolute inset-0 opacity-10 ${comparisonResult.accuracy > 90 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                
                <h3 className="text-2xl text-slate-400 mb-2 relative">Overall Performance</h3>
                <div className={`text-8xl font-black mb-6 relative ${comparisonResult.accuracy > 90 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {comparisonResult.accuracy}%
                </div>
                
                <div className="grid grid-cols-3 gap-8 mb-12 relative">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-1">Mistakes</p>
                    <p className="text-2xl font-bold text-red-400">{comparisonResult.mistakes}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-1">Words Typed</p>
                    <p className="text-2xl font-bold text-blue-400">{comparisonResult.userWords}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-1">Total Target</p>
                    <p className="text-2xl font-bold text-indigo-400">{comparisonResult.totalWords}</p>
                  </div>
                </div>

                <div className="text-left space-y-4 relative">
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <Info size={20} className="text-indigo-400" /> Comparison Verdict
                  </h4>
                  <div className="glass bg-white/5 p-8 rounded-2xl overflow-y-auto max-h-[300px] leading-relaxed text-lg">
                    {comparisonResult.analysis.map((item, idx) => (
                      <span 
                        key={idx} 
                        className={`inline-block mr-2 px-2 py-0.5 rounded-md transition-all border ${
                          item.status === 'correct' 
                            ? 'text-white border-transparent' 
                            : item.type === 'missing'
                              ? 'bg-red-500/30 text-red-100 border-red-500/50 line-through'
                              : 'bg-amber-500/30 text-amber-100 border-amber-500/50 italic'
                        }`}
                        title={item.info || (item.status === 'mistake' ? `Expected: ${item.word}` : '')}
                      >
                        {item.word}
                        {item.type === 'extra' && <span className="text-[10px] block opacity-70">extra</span>}
                        {item.type === 'missing' && <span className="text-[10px] block opacity-70">missing</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-12 flex gap-4 relative">
                  <button onClick={resetAll} className="flex-1 glass py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <RotateCcw size={18} /> Practice Other
                  </button>
                  <button onClick={() => { setStep('practice'); setUserInput(''); setIsFinished(true); setComparisonResult(null); }} className="flex-1 bg-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all">
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowWarning(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative glass-dark p-12 rounded-[2rem] max-w-lg text-center shadow-2xl border border-white/10"
            >
              <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 uppercase tracking-wider">Ready to Start?</h3>
              <p className="text-slate-400 mb-10 text-lg">
                Ensure you have your shorthand notebook and pen ready. The audio will play immediately. You cannot pause once the test begins.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowWarning(false)} className="flex-1 glass py-4 rounded-xl font-bold">Not Yet</button>
                <button 
                  onClick={startPractice}
                  className="flex-1 bg-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Start Now!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
