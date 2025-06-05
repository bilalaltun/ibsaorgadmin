/* eslint-disable */
"use client";

import {
  FaPhone,
  FaImages,
  FaBoxOpen,
  FaBlog,
  FaCertificate,
  FaBookOpen,
  FaUser,
  FaWrench,
  FaTags,
  FaLanguage,
  FaFileAlt,
  FaVideo,
  FaListAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <aside className="sidebar">
      <img
        src="https://aifdigital.com.tr/assets/img/logo/logo-white.png"
        alt="AIF Digital Logo"
        style={{
          width: "150px",
          display: "block",
          margin: "0 auto 1rem auto",
        }}
      />
      <h2 className="sidebar-title">
        AIF CMS <br /> Yönetim Paneli
      </h2>
      <nav>
        <ul className="sidebar-section">
          <li onClick={() => handleNavigate("/dashboard")}>
            <FaFileAlt /> <span>Anasayfa</span>
          </li>
          <li onClick={() => handleNavigate("/users")}>
            <FaUser /> <span>Kullanıcılar</span>
          </li>
          <li onClick={() => handleNavigate("/contact-details")}>
            <FaPhone /> <span>İletişim Bilgileri</span>
          </li>
          <li onClick={() => handleNavigate("/slider")}>
            <FaImages /> <span>Slider</span>
          </li>
          <li onClick={() => handleNavigate("/product")}>
            <FaBoxOpen /> <span>Ürünler</span>
          </li>
        </ul>

        <ul className="sidebar-section">
          <li onClick={() => handleNavigate("/blog")}>
            <FaBlog /> <span>Blog</span>
          </li>
          <li onClick={() => handleNavigate("/references")}>
            <FaBookOpen /> <span>Referanslarımız</span>
          </li>
          <li onClick={() => handleNavigate("/certificates")}>
            <FaCertificate /> <span>Sertifikalar</span>
          </li>
          <li onClick={() => handleNavigate("/catalogs")}>
            <FaBookOpen /> <span>Broşür ve Kataloglar</span>
          </li>
          <li onClick={() => handleNavigate("/usermanual")}>
            <FaBookOpen /> <span>Kullanım Kılavuzu</span>
          </li>
          <li onClick={() => handleNavigate("/settings")}>
            <FaWrench /> <span>Site Ayarları</span>
          </li>
          <li onClick={() => handleNavigate("/form-data")}>
            <FaFileAlt /> <span>Form Bilgileri</span>
          </li>
          <li onClick={() => handleNavigate("/languages")}>
            <FaLanguage /> <span>Diller</span>
          </li>
          <li onClick={() => handleNavigate("/menus")}>
            <FaListAlt /> <span>Menüler</span>
          </li>
          <li onClick={() => handleNavigate("/pages")}>
            <FaFileAlt /> <span>Sayfalar</span>
          </li>
          <li onClick={() => handleNavigate("/about")}>
            <FaFileAlt /> <span>Hakkımızda</span>
          </li>
          <li onClick={() => handleNavigate("/homepage")}>
            <FaFileAlt /> <span>Anasayfa Sabit Alanlar</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
