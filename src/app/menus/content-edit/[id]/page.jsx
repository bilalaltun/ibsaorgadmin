"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditMenuPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    url: "",
    isactive: true,
    titles: {},
    submenus: [],
  });

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLanguages = async () => {
      const res = await fetch("/api/languages");
      const data = await res.json();
      setLanguages(data);
      if (data.length > 0) setActiveLang(data[0].name);
      return data;
    };

    const fetchMenu = async (langs) => {
      try {
        const res = await fetch(`/api/menus?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı");
        const data = await res.json();

        const formattedSubmenus =
          data.submenus?.map((sm) => ({
            ...sm,
            titles: langs.reduce((acc, lang) => {
              acc[lang.name] = sm.titles?.[lang.name] || "";
              return acc;
            }, {}),
          })) || [];

        const formattedTitles = langs.reduce((acc, lang) => {
          acc[lang.name] = data.titles?.[lang.name] || "";
          return acc;
        }, {});

        setForm({
          url: data.url || "",
          isactive: data.isactive ?? true,
          titles: formattedTitles,
          submenus: formattedSubmenus,
        });
      } catch (err) {
        console.error("Menü verisi alınamadı:", err);
        setError("Menü bulunamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages().then(fetchMenu);
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangTitleChange = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      titles: {
        ...prev.titles,
        [lang]: value,
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
    languages.forEach((lang) => {
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
      languages.every((lang) => form.titles[lang.name]?.trim()) &&
      form.submenus.every(
        (submenu) =>
          submenu.url.trim() &&
          languages.every((lang) => submenu.titles[lang.name]?.trim())
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanlar zorunludur.", "warning");
      return;
    }

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");

      const payload = {
        url: form.url,
        isactive: form.isactive,
        titles: languages.map((lang) => ({
          lang_code: lang.name,
          value: form.titles[lang.name],
        })),
        submenus: form.submenus.map((submenu) => ({
          url: submenu.url,
          isactive: submenu.isactive,
          titles: languages.map((lang) => ({
            lang_code: lang.name,
            value: submenu.titles[lang.name],
          })),
        })),
      };

      const res = await fetch(`/api/menus?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      Swal.fire("Başarılı", "Menü güncellendi.", "success").then(() =>
        router.push("/menus")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Güncelleme sırasında hata oluştu.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Menü Düzenle</h2>
        {loading ? (
          <div className="loadingSpinner">Yükleniyor...</div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.tabsContainer}>
              <div className={styles.langTabs}>
                {languages.map((lang) => (
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
                  onChange={(e) => handleChange("url", e.target.value)}
                />
                <label>Başlık ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.titles[activeLang] || ""}
                  onChange={(e) =>
                    handleLangTitleChange(activeLang, e.target.value)
                  }
                />
              </div>
            </div>

            <h3>Alt Menüler</h3>
            {form.submenus.map((submenu, index) => (
              <div
                key={index}
                className={`${styles.submenuBlock} ${styles.section}`}
                style={{ position: "relative" }}
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
                  style={{ position: "absolute", top: "20px", right: "20px" }}
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
              GÜNCELLE
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
