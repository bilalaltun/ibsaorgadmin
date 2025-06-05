/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./SettingsTabs.module.css";
import Cookies from "js-cookie";
const tabs = [
  { key: "general", label: "GENEL" },
  { key: "contact", label: "İLETİŞİM BİLGİLERİ" },
  { key: "theme", label: "TEMA AYARLARI" },
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
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/sitesettings");
      const json = await res.json();
      const settings = Array.isArray(json.data) ? json.data[0] : json.data;

      setForm({
        id: settings.id || "",
        date: settings.date || "",
        general: settings.general || {},
        contact: settings.contact || {},
        theme: settings.theme || {},
      });
    } catch {
      Swal.fire("Hata", "Veriler alınamadı", "error");
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

    Swal.fire({ title: "Güncelleniyor...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");

      const cleanObject = (obj) => {
        const { id, site_id, ...rest } = obj;
        return rest;
      };

      const payload = {
        general: cleanObject(form.general),
        contact: cleanObject(form.contact),
        theme: cleanObject(form.theme),
        date: form.date || new Date().toISOString(),
      };

      const res = await fetch(`/api/sitesettings?id=${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Tüm ayarlar güncellendi", "success");
      fetchSettings();
    } catch {
      Swal.fire("Hata", "Güncelleme başarısız", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Site Ayarları</h2>

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
              <label>Site Adresi</label>
              <input
                value={form.general.site_address}
                onChange={(e) =>
                  handleChange("general", "site_address", e.target.value)
                }
              />

              <label>Site Kodu</label>
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
            </>
          )}

          {activeTab === "contact" && (
            <>
              <label>Telefon</label>
              <input
                value={form.contact.phone}
                onChange={(e) =>
                  handleChange("contact", "phone", e.target.value)
                }
              />

              <label>E-posta</label>
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
                label="Logo Yükle"
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
            TÜM AYARLARI GÜNCELLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
