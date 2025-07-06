// src/components/Layout.js
"use client"
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LiveChatBox from "./LiveChatBox";


export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isSidebarOpen && <Sidebar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main style={{ flex: 1, padding: '1rem', backgroundColor: '#ecf0f1' }}>
          {children}
        </main>
        {/* <LiveChatBox /> */}
      </div>
    </div>
  );
}