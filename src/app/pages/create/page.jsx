"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import styles from "./styles.module.css";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
const SimpleEditor = dynamic(() => import("@/package/App"), { ssr: false });

export default function CreatePage() {
  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    menu_id: 0,
    submenu_id: 0,
    link: "",
    isactive: true,
  });

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const langRes = await fetch("/api/languages");
        const langs = await langRes.json();
        setLanguages(langs);
        setActiveLang(langs[0]?.name || "");

        const initialData = {};
        langs.forEach((lang) => {
          initialData[lang.name] = {
            meta_title: "",
            page_title: "",
            meta_keywords: "",
            meta_description: "",
            content: "",
          };
        });
        setMultiLangData(initialData);

        const menuRes = await fetch("/api/menus");
        const menuData = await menuRes.json();
        setMenus(menuData.data || []);
      } catch (err) {
        console.error("Veri alınırken hata oluştu:", err);
      }
    }

    fetchInitialData();
  }, []);

  const handleLangChange = (lang, field, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return (
      form.link.trim() &&
      languages.every((lang) => {
        const entry = multiLangData[lang.name];
        return (
          entry.meta_title.trim() &&
          entry.page_title.trim() &&
          entry.meta_keywords.trim() &&
          entry.meta_description.trim() &&
          entry.content.trim()
        );
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Tüm alanları doldurun.",
      });
      return;
    }

    const titles = languages.map((lang) => ({
      lang_code: lang.name,
      ...multiLangData[lang.name],
    }));

    const payload = {
      menu_id: form.menu_id || 0,
      submenu_id: form.submenu_id || 0,
      link: form.link,
      isactive: form.isactive,
      titles,
    };

    Swal.fire({
      title: "Yükleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Oluşturulamadı");

      Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Sayfa başarıyla oluşturuldu.",
      }).then(() => {
        window.location.href = "/pages";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Yükleme sırasında hata oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang] || {};

  const selectedMenu = menus.find((m) => m.id === form.menu_id);
  const submenus = selectedMenu?.submenus || [];

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Sayfa Oluştur</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="link">Link</label>
          <input
            id="link"
            type="text"
            className={styles.input}
            value={form.link || ""}
            onChange={(e) => handleFormChange("link", e.target.value)}
          />

          <label htmlFor="menu">Menü</label>
          <select
            id="menu"
            className={styles.input}
            value={form.menu_id}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              handleFormChange("menu_id", selectedId);
              handleFormChange("submenu_id", 0);
            }}
          >
            <option value={0}>Seçiniz</option>
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.titles?.[activeLang] || `Menu ${menu.id}`}
              </option>
            ))}
          </select>

          {/* <label htmlFor="submenu">Alt Menü</label>
          <select
            id="submenu"
            className={styles.input}
            value={form.submenu_id}
            onChange={(e) =>
              handleFormChange("submenu_id", Number(e.target.value))
            }
          >
            <option value={0}>Seçiniz</option>
            {submenus.map((submenu) => (
              <option key={submenu.id} value={submenu.id}>
                {submenu.titles?.[activeLang] || `Submenu ${submenu.id}`}
              </option>
            ))}
          </select> */}

          <div className={styles.langTabs}>
            {languages.map((lang) => (
              <button
                key={lang.name}
                type="button"
                className={`${styles.input} ${
                  activeLang === lang.name ? styles.active : ""
                }`}
                onClick={() => setActiveLang(lang.name)}
              >
                {lang.name.toUpperCase()}
              </button>
            ))}
          </div>

          <label htmlFor="metaTitle">Meta Title</label>
          <input
            id="metaTitle"
            type="text"
            className={styles.input}
            value={current.meta_title || ""}
            onChange={(e) =>
              handleLangChange(activeLang, "meta_title", e.target.value)
            }
          />

          <label htmlFor="pageTitle">Page Title</label>
          <input
            id="pageTitle"
            type="text"
            className={styles.input}
            value={current.page_title || ""}
            onChange={(e) =>
              handleLangChange(activeLang, "page_title", e.target.value)
            }
          />

          <label htmlFor="metaKeywords">Meta Keywords</label>
          <input
            id="metaKeywords"
            type="text"
            className={styles.input}
            value={current.meta_keywords || ""}
            onChange={(e) =>
              handleLangChange(activeLang, "meta_keywords", e.target.value)
            }
          />

          <label htmlFor="metaDescription">Meta Description</label>
          <textarea
            id="metaDescription"
            rows={2}
            className={styles.input}
            value={current.meta_description || ""}
            onChange={(e) =>
              handleLangChange(activeLang, "meta_description", e.target.value)
            }
          />

          <label htmlFor="content">İçerik</label>
          <SimpleEditor
            key={`${activeLang}`}
            value={current.content}
            onChange={(val) => handleLangChange(activeLang, "content", val)}
          />

          <button type="submit" className={styles.submitButton}>
            OLUŞTUR
          </button>
        </form>
      </div>
    </Layout>
  );
}
