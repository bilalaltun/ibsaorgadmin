/* eslint-disable */
"use client";

import {
  FaTachometerAlt,
  FaUser,
  FaUsers,
  FaPhone,
  FaImages,
  FaBoxOpen,
  FaLayerGroup,
  FaBlog,
  FaWrench,
  FaLanguage,
  FaWpforms,
  FaListAlt,
  FaFileAlt,
  FaInfo,
  FaHome,
  FaCookieBite,
  FaShieldVirus,
  FaFlag,
  FaLink,
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
          position: "absolute",
          top: "14px",
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
      <h2 className="sidebar-title">AIF CMS Admin Panel</h2>

      <nav>
        <ul className="sidebar-section">
          <li onClick={() => handleNavigate("/dashboard")}>
            <FaTachometerAlt /> <span>Dashboard</span>
          </li>
          <li onClick={() => handleNavigate("/users")}>
            <FaUsers /> <span>Users</span>
          </li>
          <li onClick={() => handleNavigate("/team-members")}>
            <FaUser /> <span>Team Members</span>
          </li>
          <li onClick={() => handleNavigate("/contact-details")}>
            <FaPhone /> <span>Contact Info</span>
          </li>
          <li onClick={() => handleNavigate("/slider")}>
            <FaImages /> <span>Slider</span>
          </li>
          <li onClick={() => handleNavigate("/product")}>
            <FaBoxOpen /> <span>Services</span>
          </li>
          <li onClick={() => handleNavigate("/categories")}>
            <FaLayerGroup /> <span>Categories</span>
          </li>
        </ul>

        <ul className="sidebar-section">
          <li onClick={() => handleNavigate("/blog")}>
            <FaBlog /> <span>Blog</span>
          </li>
          <li onClick={() => handleNavigate("/settings")}>
            <FaWrench /> <span>Site Settings</span>
          </li>
          <li onClick={() => handleNavigate("/form-data")}>
            <FaWpforms /> <span>Form Submissions</span>
          </li>
          <li onClick={() => handleNavigate("/languages")}>
            <FaLanguage /> <span>Languages</span>
          </li>
          <li onClick={() => handleNavigate("/menus")}>
            <FaListAlt /> <span>Menus</span>
          </li>
          <li onClick={() => handleNavigate("/pages")}>
            <FaFileAlt /> <span>Pages</span>
          </li>
          <li onClick={() => handleNavigate("/about")}>
            <FaInfo /> <span>About Us</span>
          </li>
          <li onClick={() => handleNavigate("/homepage")}>
            <FaHome /> <span>Homepage Sections</span>
          </li>
          <li onClick={() => handleNavigate("/cerezler")}>
            <FaCookieBite /> <span>Cookies</span>
          </li>
          <li onClick={() => handleNavigate("/kvkk")}>
            <FaShieldVirus /> <span>Privacy Policy</span>
          </li>
          <li onClick={() => handleNavigate("/banner")}>
            <FaFlag /> <span>Banner</span>
          </li>
          <li onClick={() => handleNavigate("/references")}>
            <FaLink /> <span>References</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
