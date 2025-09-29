// src/components/Layout.js
"use client"
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';


export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Varsayılan olarak kapalı

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Ekran boyutuna göre sidebar durumunu ayarla
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false); // Mobilde kapalı
      } else {
        setIsSidebarOpen(true); // Desktop'ta açık
      }
    };

    // İlk yüklemede kontrol et
    checkScreenSize();
    
    // Ekran boyutu değişikliklerini dinle
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
      <div 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}
        onClick={(e) => {
          // Mobil görünümde sidebar açıkken overlay'e tıklayınca kapat
          if (window.innerWidth <= 1024 && isSidebarOpen && e.target === e.currentTarget) {
            setIsSidebarOpen(false);
          }
        }}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main style={{ flex: 1, padding: '1rem', backgroundColor: '#ecf0f1' }}>
          {children}
        </main>
        {/* <LiveChatBox /> */}
      </div>
    </div>
  );
}