import React from 'react';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => navigate('/login'));
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/30 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
        <Link to="/home" className="text-xl font-bold tracking-tight text-slate-800">
          MyID
        </Link>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm font-medium text-slate-600 hidden sm:block">สวัสดี, {user.username || 'ผู้ใช้งาน'}</span>}
          <button 
            onClick={handleLogout} 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;