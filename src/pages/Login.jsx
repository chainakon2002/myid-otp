import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [loginMode, setLoginMode] = useState('phone'); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('INPUT_PHONE'); 
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- ส่วนจัดการ 6 ช่อง OTP ---
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false; 

    const newOtp = [...otpArray];
    newOtp[index] = element.value;
    setOtpArray(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.some(isNaN)) return; 

    const newOtp = [...otpArray];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtpArray(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };
  // -----------------------------

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-login', {
        size: 'invisible',
      });
    }
  };

  const requestOTP = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formatPhone = '+66' + phoneNumber.replace(/^0/, ''); 
      const confirmationResult = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      setResult(confirmationResult);
      setStep('INPUT_OTP');
      setOtpArray(new Array(6).fill("")); // ล้างช่อง OTP เผื่อขอกลับมากรอกใหม่
    } catch (err) {
      setError('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    const otpString = otpArray.join(''); 

    if (otpString.length !== 6) {
      return setError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
    }

    try {
      await result.confirm(otpString);
      navigate('/home'); 
    } catch (err) {
      setError('รหัส OTP ไม่ถูกต้อง');
      setOtpArray(new Array(6).fill(""));
      inputRefs.current[0].focus();
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4 font-sans">
      {/* วงกลมลวดลายพื้นหลังเพื่อโชว์เอฟเฟกต์กระจก */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md p-8 bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-xl z-10">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8 tracking-tight">เข้าสู่ระบบ</h2>
        
        {/* Tab สลับโหมด */}
        <div className="flex bg-white/40 p-1 rounded-xl mb-6 backdrop-blur-sm shadow-inner">
          <button 
            onClick={() => { setLoginMode('phone'); setError(''); setStep('INPUT_PHONE'); }} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMode === 'phone' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            เบอร์โทรศัพท์
          </button>
          <button 
            onClick={() => { setLoginMode('email'); setError(''); }} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMode === 'email' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            อีเมล
          </button>
        </div>

        {/* 🚨 แก้บั๊ก reCAPTCHA หาย: วางไว้นอกการเช็คเงื่อนไขฟอร์ม เพื่อให้อยู่ในหน้าเว็บเสมอ 🚨 */}
        <div id="recaptcha-login"></div>

        {error && <div className="p-3 mb-4 text-xs font-medium text-red-600 bg-red-100/50 rounded-xl text-center border border-red-200 animate-pulse">{error}</div>}

        {loginMode === 'phone' ? (
          step === 'INPUT_PHONE' ? (
            <form onSubmit={requestOTP} className="space-y-4">
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="เบอร์โทรศัพท์ (08xxxxxxxx)" className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all shadow-sm" required />
              <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">ส่งรหัส OTP</button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-4">
              {/* ช่องกรอก OTP 6 ช่อง */}
              <div className="flex justify-between gap-2 mb-6">
                {otpArray.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-2xl font-bold text-slate-800 bg-white/70 border border-white/50 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:bg-white outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">ยืนยันรหัส</button>
              <button type="button" onClick={() => setStep('INPUT_PHONE')} className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">เปลี่ยนเบอร์โทรศัพท์</button>
            </form>
          )
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all shadow-sm" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all shadow-sm" required />
            <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">เข้าสู่ระบบด้วยอีเมล</button>
          </form>
        )}

        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          ยังไม่มีบัญชีใช่ไหม? <Link to="/register" className="text-blue-600 font-bold hover:text-blue-800 transition-colors ml-1">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;