/* eslint-disable */
"use client";

import {
  FaTachometerAlt,
  FaUserCog,
  FaUsers,
  FaPhone,
  FaImages,
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
  FaNewspaper,
  FaClock,
  FaCalendarAlt,
  FaGlobeEurope,
  FaUserFriends,
  FaSms,
  FaPage4,
  FaDownload,
} from "react-icons/fa"; // Not: bazıları fa'da olabilir, gerektiğinde değiştir

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
            <FaUserCog /> <span>Team Members</span>
          </li>

          <li onClick={() => handleNavigate("/categories")}>
            <FaLayerGroup /> <span>Categories</span>
          </li>
          <li onClick={() => handleNavigate("/blog")}>
            <FaNewspaper /> <span>News</span>
          </li>
          <li onClick={() => handleNavigate("/events")}>
            <FaCalendarAlt /> <span>Events</span>
          </li>
          <li onClick={() => handleNavigate("/regions")}>
            <FaGlobeEurope /> <span>Regions</span>
          </li>
          <li onClick={() => handleNavigate("/regions-members")}>
            <FaUserFriends /> <span>Regions Members</span>
          </li>
          <li onClick={() => handleNavigate("/countries")}>
            <FaFlag /> <span>Countries</span>
          </li>
          <li onClick={() => handleNavigate("/countdowns")}>
            <FaClock /> <span>Countdowns</span>
          </li>
          <li onClick={() => handleNavigate("/notifications")}>
            <FaSms /> <span>Notifications</span>
          </li>
          <li onClick={() => handleNavigate("/contact-details")}>
            <FaPhone /> <span>Contact Info</span>
          </li>
          <li onClick={() => handleNavigate("/menus")}>
            <FaListAlt /> <span>Menus</span>
          </li>
          <li onClick={() => handleNavigate("/pages")}>
            <FaWpforms /> <span>Pages</span>
          </li>
          <li onClick={() => handleNavigate("/references")}>
            <FaLink /> <span>Partners</span>
          </li>
          <li onClick={() => handleNavigate("/downloads")}>
            <FaDownload /> <span>Downloads</span>
          </li>
          <li onClick={() => handleNavigate("/members")}>
            <FaDownload /> <span>Commitee & Referees</span>
          </li>
        </ul>

        {/* <ul className="sidebar-section">
          <li onClick={() => handleNavigate("/slider")}>
            <FaImages /> <span>Slider</span>
          </li>
          <li onClick={() => handleNavigate("/form-data")}>
            <FaWpforms /> <span>Form Submissions</span>
          </li>
          <li onClick={() => handleNavigate("/settings")}>
            <FaWrench /> <span>Site Settings</span>
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
     
        </ul> */}
      </nav>
    </aside>
  );
}
