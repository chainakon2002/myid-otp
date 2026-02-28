import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <--- เพิ่มบรรทัดนี้เพื่อดึง Tailwind CSS มาใช้งาน

ReactDOM.createRoot(document.getElementById('root')).render(
  // ปิด StrictMode ไว้ชั่วคราวเพื่อป้องกัน reCAPTCHA render เบิ้ลตอน Development
  <App />
)