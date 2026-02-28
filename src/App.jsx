import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินแบบ Real-time
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // ถ้าล็อกอินอยู่ ให้ไปดึงข้อมูลชื่อผู้ใช้จาก Firestore มาเก็บไว้ใน State กลาง
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        {/* แสดง Navbar เฉพาะตอนที่มีการล็อกอินแล้ว */}
        {user && <Navbar user={userData} />}
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* หน้า Login & Register: ถ้าล็อกอินแล้ว ให้เด้งไปหน้า Home ทันที */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/home" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/home" /> : <Register />} 
          />

          {/* หน้า Home: ถ้ายังไม่ล็อกอิน ให้เตะกลับไปหน้า Login (Protected Route) */}
          <Route 
            path="/home" 
            element={user ? <Home /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;