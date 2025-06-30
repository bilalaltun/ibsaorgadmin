/* eslint-disable */
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

export default function Navbar({ toggleSidebar }) {
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const name = Cookies.get("username") || "Kullanıcı";
    setUsername(name);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/sitesettings");
      const json = await res.json();
      const settings = Array.isArray(json.data) ? json.data[0] : json.data;
      setLogo(settings.theme.logo_img);
    } catch {}
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogout = () => {
    Cookies.remove("username");
    Cookies.remove("token");
    window.location.reload();
  };

  return (
    <header
      style={{
        background:
          "linear-gradient(to left, #0a0f3c 0%, #1f2a60 40%, #4581c6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        height: "60px",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          fontSize: "1.5rem",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {/* Logo */}
      {logo && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src={logo} alt="Logo" className="logo" />
        </div>
      )}

      {/* Kullanıcı Dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "6px",
            color: "#fff",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "0.95rem",
            transition: "background 0.2s",
          }}
        >
          {username} ⯆
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              marginTop: "8px",
              backgroundColor: "#fff",
              color: "#333",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              minWidth: "140px",
              zIndex: 1000,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              🚪 Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
