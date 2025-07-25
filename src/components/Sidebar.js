import {
  FaTachometerAlt,
  FaUserCog,
  FaUsers,
  FaPhone,
  FaImages,
  FaLayerGroup,
  FaWrench,
  FaWpforms,
  FaListAlt,
  FaFlag,
  FaLink,
  FaNewspaper,
  FaClock,
  FaCalendarAlt,
  FaGlobeEurope,
  FaUserFriends,
  FaSms,
  FaDownload,
  FaClipboardList, // Used for "Commitee & Referees"
  FaImage, // Used for "Banner Image"
  FaExternalLinkAlt, // Used for "Site Links"
} from "react-icons/fa";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar({ toggleSidebar }) {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const handleNavigate = (path) => {
    router.push(path);
  };

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        setRole(parsedUser?.role || null);
      } catch (error) {
        console.error("Error parsing 'user' cookie:", error);
      }
    }
  }, []);

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
          {role ? (
            <>
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
              <li onClick={() => handleNavigate("/regions")}>
                <FaGlobeEurope /> <span>Regions</span>
              </li>
              <li onClick={() => handleNavigate("/regions-members")}>
                <FaUserFriends /> <span>Regions Members</span>
              </li>
              <li onClick={() => handleNavigate("/countries")}>
                <FaFlag /> <span>Countries</span>
              </li>
              <li onClick={() => handleNavigate("/blog")}>
                <FaNewspaper /> <span>News</span>
              </li>
              <li onClick={() => handleNavigate("/events")}>
                <FaCalendarAlt /> <span>Events</span>
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
              <li onClick={() => handleNavigate("/media-accreditation")}>
                <FaClipboardList /> <span>Form Submissions</span>
              </li>
              <li onClick={() => handleNavigate("/members")}>
                <FaClipboardList /> <span>Commitee & Referees</span>
              </li>
              <li onClick={() => handleNavigate("/banner")}>
                <FaImage /> <span>Banner Image</span>
              </li>
              <li onClick={() => handleNavigate("/settings")}>
                <FaWrench /> <span>Site Settings</span>
              </li>
              <li onClick={() => handleNavigate("/slider")}>
                <FaImages /> <span>Slider</span>
              </li>
              <li onClick={() => handleNavigate("/site-links")}>
                <FaExternalLinkAlt /> <span>Site Links</span>
              </li>
            </>
          ) : (
            <>
              <li onClick={() => handleNavigate("/blog")}>
                <FaNewspaper /> <span>News</span>
              </li>
              <li onClick={() => handleNavigate("/events")}>
                <FaCalendarAlt /> <span>Events</span>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
