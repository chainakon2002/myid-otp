import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../pages/Navbar';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      
      // 1. ถ้าไม่มี User ล็อกอิน ให้เด้งไปหน้า Login
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // 2. ลองดึงด้วย UID (กรณีสมัครด้วย Email หรือเชื่อมบัญชีแล้ว)
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else if (currentUser.phoneNumber) {
          // 3. ถ้าไม่เจอด้วย UID แต่มีเบอร์โทร (กรณี Login ด้วย OTP ครั้งแรก)
          const formatPhone = '0' + currentUser.phoneNumber.replace('+66', '');
          const q = query(collection(db, 'users'), where('phone', '==', formatPhone));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12 px-4">
      <Navbar user={userData} />
      
      <div className="max-w-4xl mx-auto relative">
        {/* Background Blur Blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        
        <div className="relative z-10 mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">บัญชี MyID</h1>
          <p className="mt-2 text-lg text-slate-500 font-medium">จัดการข้อมูลส่วนตัวและการตั้งค่าความปลอดภัย</p>
        </div>
        
        {error ? (
          <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-center font-medium">
            {error}
          </div>
        ) : userData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <ProfileCard label="ชื่อผู้ใช้" value={userData.username} icon="👤" />
            <ProfileCard label="ชื่อ-นามสกุล" value={userData.fullName} icon="📝" />
            <ProfileCard label="เบอร์โทรศัพท์" value={userData.phone} icon="📱" />
            <ProfileCard label="อีเมล" value={userData.email} icon="✉️" />
          </div>
        ) : (
          <div className="p-12 bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-sm text-center text-slate-500 font-medium">
            ไม่พบข้อมูลโปรไฟล์ในระบบ <br/>
            <span className="text-sm font-normal text-slate-400 italic">(อาจเกิดจากการเข้าใช้งานด้วยเบอร์โทรที่ยังไม่ได้ลงทะเบียน)</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileCard = ({ label, value, icon }) => (
  <div className="group p-8 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
        <p className="text-2xl font-semibold text-slate-800 tracking-tight">{value || '-'}</p>
      </div>
      <span className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity">{icon}</span>
    </div>
  </div>
);

export default Home;