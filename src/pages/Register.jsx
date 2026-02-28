import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
    emailPrefix: '', 
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    // ป้องกันคนเผลอพิมพ์ @ เข้ามาในช่อง
    if (e.target.name === 'emailPrefix') {
      const cleanValue = e.target.value.replace(/@.*/, '');
      setFormData({ ...formData, [e.target.name]: cleanValue });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
    }

    setLoading(true);

    try {
      const fullEmail = `${formData.emailPrefix}@gmail.com`;

      const phoneQuery = query(collection(db, 'users'), where('phone', '==', formData.phone));
      const phoneSnap = await getDocs(phoneQuery);

      if (!phoneSnap.empty) {
        throw new Error('เบอร์โทรศัพท์นี้ถูกใช้งานไปแล้ว');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, fullEmail, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        fullName: formData.fullName,
        phone: formData.phone,
        email: fullEmail,
        createdAt: new Date(),
        provider: 'email'
      });

      const templateParams = {
        to_name: formData.fullName,
        to_email: fullEmail,
        message: 'ขอบคุณที่สมัครสมาชิก MyID ระบบได้ลงทะเบียนบัญชีของคุณเรียบร้อยแล้ว'
      };

     await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID, 
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID, 
  templateParams, 
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);

      navigate('/home'); 
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานไปแล้ว');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-pink-100 p-6">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

      <div className="relative w-full max-w-lg p-10 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-2xl z-10 transition-all duration-500 mt-8 mb-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">สร้างบัญชีใหม่</h2>
          <p className="text-slate-500 font-medium">เริ่มต้นใช้งาน MyID ของคุณ</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-md border border-red-200 text-red-600 text-sm rounded-2xl text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">ชื่อผู้ใช้</label>
              <input type="text" name="username" placeholder="Username" onChange={handleChange} className="w-full px-5 py-3.5 bg-white/50 border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">ชื่อ-นามสกุล</label>
              <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full px-5 py-3.5 bg-white/50 border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">เบอร์โทรศัพท์</label>
            <input type="tel" name="phone" placeholder="08xxxxxxxx" onChange={handleChange} className="w-full px-5 py-3.5 bg-white/50 border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm" required />
          </div>

          {/* 🚨 ส่วนที่มีการอัปเดตเอฟเฟกต์ @gmail.com 🚨 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">อีเมล (Gmail เท่านั้น)</label>
            <div className="flex items-center bg-white/50 border border-white/40 rounded-2xl focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all shadow-sm overflow-hidden">
              <input 
                type="text" 
                name="emailPrefix" 
                value={formData.emailPrefix}
                placeholder="พิมพ์ชื่ออีเมลของคุณ" 
                onChange={handleChange} 
                className="w-full px-5 py-3.5 bg-transparent outline-none text-slate-800 placeholder-slate-400" 
                required 
              />
              <span 
                className={`whitespace-nowrap pr-5 py-3.5 select-none transition-all duration-500 ease-out transform ${
                  formData.emailPrefix.length > 0 
                    ? 'opacity-100 translate-x-0 text-blue-600 font-bold scale-100' 
                    : 'opacity-0 translate-x-8 text-slate-300 font-medium scale-90 pointer-events-none'
                }`}
              >
                @gmail.com
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">รหัสผ่าน</label>
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange} className="w-full px-5 py-3.5 bg-white/50 border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm" required minLength="6" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">ยืนยันรหัสผ่าน</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} className="w-full px-5 py-3.5 bg-white/50 border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm" required minLength="6" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-4 mt-6 text-white font-bold rounded-2xl shadow-xl transition-all transform active:scale-[0.98] ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                กำลังดำเนินการ...
              </span>
            ) : 'ลงทะเบียนบัญชีใหม่'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors font-bold ml-1">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;