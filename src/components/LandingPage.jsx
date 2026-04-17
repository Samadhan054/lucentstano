import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck, PenTool, BookOpen, Terminal } from 'lucide-react';

const LandingPage = ({ onOpenLogin }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden flex flex-col items-center">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-blue-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl px-8 py-6 flex justify-between items-center z-50">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <PenTool className="text-indigo-400 w-8 h-8" />
          <span className="text-2xl font-bold tracking-tighter text-white">LUCENT STANO</span>
        </motion.div>
        
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-6 items-center"
        >
          <button className="text-slate-300 hover:text-white transition-colors font-medium">About</button>
          <button className="text-slate-300 hover:text-white transition-colors font-medium">Courses</button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center justify-center gap-16 z-10 pt-12 pb-24"
      >
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl lg:text-8xl font-black text-white leading-tight">
              Master the Art of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Shorthand</span>
            </h1>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl leading-relaxed">
              Unlock the secrets of efficient stenography with Lucent Stano. 
              The ultimate platform for students to reach professional speeds with precision.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-6 justify-center lg:justify-start">
            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25 group">
              <UserPlus className="group-hover:scale-110 transition-transform" />
              Sign Up Now
            </button>
            <button 
              onClick={() => { console.log("Login button clicked"); onOpenLogin(); }}
              className="px-8 py-4 glass hover:bg-white/20 text-white rounded-full font-bold text-lg flex items-center gap-2 transition-all group pointer-events-auto"
            >
              <LogIn className="group-hover:translate-x-1 transition-transform" />
              Login
            </button>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="flex-1 relative"
        >
          <div className="relative z-10 glass-dark p-2 rounded-3xl overflow-hidden shadow-2xl skew-y-3">
            <img 
              src="/assets/steno.png" 
              alt="Steno Essence" 
              className="rounded-2xl w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          </div>
          {/* Decorative floating card */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 glass p-6 rounded-2xl shadow-xl z-20 hidden lg:block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Speed Goal</p>
                <p className="text-xl font-bold text-white">120 WPM</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Quick Stats Section */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full max-w-7xl px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 z-10"
      >
        <div className="text-center group cursor-default">
          <p className="text-4xl lg:text-5xl font-black text-indigo-400 mb-2 group-hover:scale-110 transition-transform">500+</p>
          <p className="text-slate-400 font-medium">Active Students</p>
        </div>
        <div className="text-center group cursor-default text-glow">
          <p className="text-4xl lg:text-5xl font-black text-purple-400 mb-2 group-hover:scale-110 transition-transform">140+</p>
          <p className="text-slate-400 font-medium">Max Speed WPM</p>
        </div>
        <div className="text-center group cursor-default">
          <p className="text-4xl lg:text-5xl font-black text-blue-400 mb-2 group-hover:scale-110 transition-transform">50+</p>
          <p className="text-slate-400 font-medium">Curated Lessons</p>
        </div>
        <div className="text-center group cursor-default">
          <p className="text-4xl lg:text-5xl font-black text-emerald-400 mb-2 group-hover:scale-110 transition-transform">98%</p>
          <p className="text-slate-400 font-medium">Accuracy Goal</p>
        </div>
      </motion.div>

      {/* Action Sections (Glassmorphism Cards) */}
      <div className="w-full max-w-7xl px-8 pb-32 grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
        <motion.div 
          whileHover={{ y: -10 }}
          onClick={() => { console.log("Student card clicked"); onOpenLogin(); }}
          className="glass-dark p-8 rounded-3xl border border-white/5 hover:border-indigo-500/50 transition-all group cursor-pointer pointer-events-auto"
        >
          <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600/40 transition-colors">
            <LogIn className="text-indigo-400 pb-1" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Student Login</h3>
          <p className="text-slate-400 mb-6 font-medium">Access your personal dashboard, practice sessions, and speed tests.</p>
          <div className="text-indigo-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
            Enter Dashboard <LogIn size={18} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10 }}
          onClick={onOpenLogin}
          className="glass-dark p-8 rounded-3xl border border-white/5 hover:border-purple-500/50 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600/40 transition-colors">
            <UserPlus className="text-purple-400 pb-1" />
          </div>
          <h3 className="text-2xl font-bold mb-3">New Registration</h3>
          <p className="text-slate-400 mb-6 font-medium">Start your journey today. Join hundreds of students mastering shorthand.</p>
          <button className="text-purple-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
            Create Account <UserPlus size={18} />
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10 }}
          onClick={() => { console.log("Admin card clicked"); onOpenLogin(); }}
          className="glass-dark p-8 rounded-3xl border border-white/5 hover:border-emerald-500/50 transition-all group cursor-pointer pointer-events-auto"
        >
          <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600/40 transition-colors">
            <ShieldCheck className="text-emerald-400 pb-1" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Admin Access</h3>
          <p className="text-slate-400 mb-6 font-medium">Institutional management, track student progress, and update curriculum.</p>
          <div className="text-emerald-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
            Admin Portal <ShieldCheck size={18} />
          </div>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <footer className="w-full py-8 text-center border-t border-white/5 z-10">
        <p className="text-slate-500 text-sm">© 2026 Lucent Stano Academy. Precision in Every Stroke.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
