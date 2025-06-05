"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateMenuPage() {
  const [langs, setLangs] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");

  const [form, setForm] = useState({
    url: "",
    isactive: true,
    titles: {},
    submenus: [],
  });

  useEffect(() => {
    const fetchLanguages = async () => {
      const res = await fetch("/api/languages");
      const data = await res.json();
      setLangs(data);
      if (data.length > 0) setActiveLang(data[0].name);

      const initialTitles = {};
      data.forEach((lang) => {
        initialTitles[lang.name] = "";
      });

      setForm((prev) => ({ ...prev, titles: initialTitles }));
    };

    fetchLanguages();
  }, []);

  const handleMainTitleChange = (langCode, value) => {
    setForm((prev) => ({
      ...prev,
      titles: {
        ...prev.titles,
        [langCode]: value,
      },
    }));
  };

  const handleSubmenuChange = (index, field, lang, value) => {
    const updated = [...form.submenus];
    if (field === "titles") {
      updated[index].titles[lang] = value;
    } else {
      updated[index][field] = value;
    }
    setForm((prev) => ({ ...prev, submenus: updated }));
  };

  const removeSubmenu = (index) => {
    setForm((prev) => ({
      ...prev,
      submenus: prev.submenus.filter((_, i) => i !== index),
    }));
  };

  const addSubmenu = () => {
    const newTitles = {};
    langs.forEach((lang) => {
      newTitles[lang.name] = "";
    });

    setForm((prev) => ({
      ...prev,
      submenus: [
        ...prev.submenus,
        { url: "", isactive: true, titles: newTitles },
      ],
    }));
  };

  const isFormValid = () => {
    return (
      form.url.trim() &&
      langs.every((lang) => form.titles[lang.name]?.trim()) &&
      form.submenus.every(
        (submenu) =>
          submenu.url.trim() &&
          langs.every((lang) => submenu.titles[lang.name]?.trim())
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanlar zorunludur.", "warning");
      return;
    }

    Swal.fire({ title: "Kaydediliyor...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");

      const payload = {
        url: form.url,
        isactive: form.isactive,
        titles: langs.map((lang) => ({
          lang_code: lang.name,
          value: form.titles[lang.name],
        })),
        submenus: form.submenus.map((submenu) => ({
          url: submenu.url,
          isactive: submenu.isactive,
          titles: langs.map((lang) => ({
            lang_code: lang.name,
            value: submenu.titles[lang.name],
          })),
        })),
      };

      const res = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Menü kaydedildi.", "success");
      setForm({
        url: "",
        isactive: true,
        titles: langs.reduce((acc, lang) => {
          acc[lang.name] = "";
          return acc;
        }, {}),
        submenus: [],
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Menü kaydedilemedi.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Menü Oluştur</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.tabsContainer}>
            <div className={styles.langTabs}>
              {langs.map((lang) => (
                <button
                  key={lang.name}
                  type="button"
                  className={
                    activeLang === lang.name ? styles.active : styles.tab
                  }
                  onClick={() => setActiveLang(lang.name)}
                >
                  {lang.name.toUpperCase()}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              <label>Ana Menü URL</label>
              <input
                type="text"
                className={styles.input}
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <label>Başlık ({activeLang.toUpperCase()})</label>
              <input
                type="text"
                className={styles.input}
                value={form.titles[activeLang] || ""}
                onChange={(e) =>
                  handleMainTitleChange(activeLang, e.target.value)
                }
              />
            </div>
          </div>

          <h3>Alt Menü(ler)</h3>
          {form.submenus.map((submenu, index) => (
            <div
              key={index}
              className={`${styles.submenuBlock} ${styles.section}`}
              style={{
                position: "relative",
              }}
            >
              <label>Alt Menü URL</label>
              <input
                type="text"
                className={styles.input}
                value={submenu.url}
                onChange={(e) =>
                  handleSubmenuChange(index, "url", null, e.target.value)
                }
              />
              <label>Alt Başlık ({activeLang.toUpperCase()})</label>
              <input
                type="text"
                className={styles.input}
                value={submenu.titles?.[activeLang] || ""}
                onChange={(e) =>
                  handleSubmenuChange(
                    index,
                    "titles",
                    activeLang,
                    e.target.value
                  )
                }
              />
              <button
                type="button"
                onClick={() => removeSubmenu(index)}
                className={styles.deleteButton}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                }}
              >
                ❌ Kaldır
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSubmenu}
            className={styles.addButton}
          >
            ➕ Alt Menü Ekle
          </button>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
          >
            MENÜYÜ KAYDET
          </button>
        </form>
      </div>
    </Layout>
  );
}
