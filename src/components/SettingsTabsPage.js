/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./SettingsTabs.module.css";
import Cookies from "js-cookie";

const tabs = [
  { key: "general", label: "GENERAL" },
  { key: "contact", label: "CONTACT INFORMATION" },
  { key: "theme", label: "THEME SETTINGS" },
];

export default function SettingsTabsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({
    general: {
      site_address: "",
      site_code: "",
      google_analytics: "",
      whatsapp_number: "",
    },
    contact: {
      phone: "",
      email: "",
    },
    theme: {
      logo_img: "",
      facebook: "",
      youtube: "",
      linkedin: "",
      instagram: "",
      twitter: "",
    },
    id: null,
    date: "",
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/sitesettings");
      const json = await res.json();
      const settings = Array.isArray(json.data) ? json.data[0] : json.data;

      setForm({
        id: settings.id || null,
        date: settings.date || "",
        general: {
          site_address: settings.site_address || "",
          site_code: settings.site_code || "",
          google_analytics: settings.google_analytics || "",
          whatsapp_number: settings.whatsapp_number || "",
        },
        contact: {
          phone: settings.phone || "",
          email: settings.email || "",
        },
        theme: {
          logo_img: settings.logo_img || "",
          facebook: settings.facebook || "",
          youtube: settings.youtube || "",
          linkedin: settings.linkedin || "",
          instagram: settings.instagram || "",
          twitter: settings.twitter || "",
        },
      });
    } catch {
      Swal.fire("Error", "Data could not be retrieved", "error");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");

      const payload = {
        general: form.general,
        contact: form.contact,
        theme: form.theme,
        date: form.date || new Date().toISOString(),
      };

      const method = form.id ? "PUT" : "POST";
      const endpoint = form.id
        ? `/api/sitesettings?id=${form.id}`
        : `/api/sitesettings`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Settings saved successfully", "success");
      fetchSettings();
    } catch {
      Swal.fire("Error", "Settings could not be saved", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Site Settings</h2>

        <div className={styles.tabMenu}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tabButton} ${
                activeTab === tab.key ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`${styles.tabContent} ${styles["form-card"]}`}
        >
          {activeTab === "general" && (
            <>
              <label>Site Address</label>
              <input
                value={form.general.site_address}
                onChange={(e) =>
                  handleChange("general", "site_address", e.target.value)
                }
              />

              <label>Site Code</label>
              <input
                value={form.general.site_code}
                onChange={(e) =>
                  handleChange("general", "site_code", e.target.value)
                }
              />

              <label>Google Analytics</label>
              <input
                value={form.general.google_analytics}
                onChange={(e) =>
                  handleChange("general", "google_analytics", e.target.value)
                }
              />

              <label>WhatsApp Number</label>
              <input
                value={form.general.whatsapp_number}
                onChange={(e) =>
                  handleChange("general", "whatsapp_number", e.target.value)
                }
              />
            </>
          )}

          {activeTab === "contact" && (
            <>
              <label>Phone</label>
              <input
                value={form.contact.phone}
                onChange={(e) =>
                  handleChange("contact", "phone", e.target.value)
                }
              />

              <label>Email</label>
              <input
                value={form.contact.email}
                onChange={(e) =>
                  handleChange("contact", "email", e.target.value)
                }
              />
            </>
          )}

          {activeTab === "theme" && (
            <>
              <label>Logo</label>
              <UploadField
                type="image"
                value={form.theme.logo_img}
                onChange={(url) => handleChange("theme", "logo_img", url)}
                label="Upload Logo"
                accept="image/*"
              />

              <label>Facebook</label>
              <input
                value={form.theme.facebook}
                onChange={(e) =>
                  handleChange("theme", "facebook", e.target.value)
                }
              />

              <label>Youtube</label>
              <input
                value={form.theme.youtube}
                onChange={(e) =>
                  handleChange("theme", "youtube", e.target.value)
                }
              />

              <label>Linkedin</label>
              <input
                value={form.theme.linkedin}
                onChange={(e) =>
                  handleChange("theme", "linkedin", e.target.value)
                }
              />

              <label>Instagram</label>
              <input
                value={form.theme.instagram}
                onChange={(e) =>
                  handleChange("theme", "instagram", e.target.value)
                }
              />

              <label>Twitter</label>
              <input
                value={form.theme.twitter}
                onChange={(e) =>
                  handleChange("theme", "twitter", e.target.value)
                }
              />
            </>
          )}

          <button type="submit" className={styles.saveButton}>
            SAVE ALL SETTINGS
          </button>
        </form>
      </div>
    </Layout>
  );
}
