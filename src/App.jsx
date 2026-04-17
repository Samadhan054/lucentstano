import React, { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import StudentDashboard from './components/StudentDashboard'

function App() {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('steno_session');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
        }
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log("Login successful:", userData);
    setUser(userData);
    localStorage.setItem('steno_session', JSON.stringify(userData));
    setIsLoginOpen(false); // Extra safety
  };

  const handleLogout = () => {
    console.log("Logging out");
    setUser(null);
    localStorage.removeItem('steno_session');
  };

  // Rendering based on state
  return (
    <div className="min-h-screen bg-slate-950">
      {user?.role === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : user?.role === 'student' ? (
        <StudentDashboard user={user} onLogout={handleLogout} />
      ) : (
        <>
          <LandingPage onOpenLogin={() => setIsLoginOpen(true)} />
          <Login
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </>
      )}
    </div>
  )
}

export default App
