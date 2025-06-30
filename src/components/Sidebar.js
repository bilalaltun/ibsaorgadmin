/* eslint-disable */
"use client";

import {
  FaPhone,
  FaImages,
  FaBoxOpen,
  FaBlog,
  FaUser,
  FaWrench,
  FaLanguage,
  FaFileAlt,
  FaListAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Sidebar({ toggleSidebar }) {
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <aside className="sidebar">
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="d-hidden"
        style={{
          position: 'absolute',
          top: '14px',
          fontSize: "1.5rem",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        x
      </button>
      <img
        src="https://aifdigital.com.tr/assets/img/logo/logo-white.png"
        alt="AIF Digital Logo"
        style={{
          width: "150px",
          display: "block",
          margin: "0 auto 1rem auto",
        }}
      />
      <h2 className="sidebar-title">AIF CMS İdarə Paneli</h2>
      <nav>
        <ul className="sidebar-section">
          <li onClick={() => handleNavigate("/dashboard")}>
            <FaFileAlt /> <span>Əsas Səhifə</span>
          </li>
          <li onClick={() => handleNavigate("/users")}>
            <FaUser /> <span>İstifadəçilər</span>
          </li>
          <li onClick={() => handleNavigate("/team-members")}>
            <FaUser /> <span>Komanda Üzvləri</span>
          </li>
          <li onClick={() => handleNavigate("/contact-details")}>
            <FaPhone /> <span>Əlaqə Məlumatları</span>
          </li>
          <li onClick={() => handleNavigate("/slider")}>
            <FaImages /> <span>Slayder</span>
          </li>
          <li onClick={() => handleNavigate("/product")}>
            <FaBoxOpen /> <span>Xidmətlər</span>
          </li>
          <li onClick={() => handleNavigate("/categories")}>
            <FaBoxOpen /> <span>Kateqoriyalar</span>
          </li>
        </ul>

        <ul className="sidebar-section">
          <li onClick={() => handleNavigate("/blog")}>
            <FaBlog /> <span>Bloq</span>
          </li>
          <li onClick={() => handleNavigate("/settings")}>
            <FaWrench /> <span>Sayt Ayarları</span>
          </li>
          <li onClick={() => handleNavigate("/form-data")}>
            <FaFileAlt /> <span>Form Məlumatları</span>
          </li>
          <li onClick={() => handleNavigate("/languages")}>
            <FaLanguage /> <span>Dillər</span>
          </li>
          <li onClick={() => handleNavigate("/menus")}>
            <FaListAlt /> <span>Menyular</span>
          </li>
          <li onClick={() => handleNavigate("/pages")}>
            <FaFileAlt /> <span>Səhifələr</span>
          </li>
          <li onClick={() => handleNavigate("/about")}>
            <FaFileAlt /> <span>Haqqımızda</span>
          </li>
          <li onClick={() => handleNavigate("/homepage")}>
            <FaFileAlt /> <span>Əsas Səhifə Sabit Sahələr</span>
          </li>
          <li onClick={() => handleNavigate("/cerezler")}>
            <FaFileAlt /> <span>Çərəzlər</span>
          </li>
          <li onClick={() => handleNavigate("/kvkk")}>
            <FaFileAlt /> <span>Məxfilik Siyasəti</span>
          </li>
          <li onClick={() => handleNavigate("/banner")}>
            <FaFileAlt /> <span>Banner</span>
          </li>
          <li onClick={() => handleNavigate("/references")}>
            <FaFileAlt /> <span>Referanslar</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
