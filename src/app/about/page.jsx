"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./EditAboutContentPage.module.css";

const PlaygroundApp = dynamic(() => import("@/package/App"), { ssr: false });

export default function EditAboutContentPage() {
  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/languages");
        const data = await res.json();
        const langs = data.map((l) => l.name);
        setLanguages(langs);
        setActiveLang(langs[0]);

        const initialLangData = langs.reduce((acc, lang) => {
          acc[lang] = { title: "", content: "" };
          return acc;
        }, {});
        setMultiLangData(initialLangData);
      } catch (err) {
        console.error("Dil verisi alınamadı:", err);
      }
    }

    fetchLanguages();
  }, []);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await fetch("/api/homepage/about");
        if (!res.ok) throw new Error("Hakkımızda verisi alınamadı.");
        const data = await res.json();
        if (!data || !data.section) return;

        const updated = { ...multiLangData };
        Object.keys(data.section).forEach((lang) => {
          updated[lang] = {
            title: data.section[lang].title || "",
            description: data.section[lang].description || "",
          };
        });
        setMultiLangData(updated);
      } catch (err) {
        console.error("GET Hatası:", err);
      }
    }

    if (languages.length > 0) fetchAbout();
  }, [languages]);

  const handleLangChange = (lang, field, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const handleSave = async () => {
    const translations = languages.map((lang) => ({
      langCode: lang,
      title: multiLangData[lang].title,
      description: multiLangData[lang].description,
    }));

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/homepage/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ translations }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız oldu.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Hakkımızda içeriği güncellendi.",
      });
    } catch (err) {
      console.error("PUT Hatası:", err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Veri kaydı sırasında sorun oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang] || {};

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Hakkımızda Alanını Düzenle</h2>

        {languages.length > 0 && (
          <>
            <div className={styles.langTabs}>
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={activeLang === lang ? styles.active : ""}
                  onClick={() => setActiveLang(lang)}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className={styles.section}>
              <label htmlFor="title">Başlık</label>
              <input
                id="title"
                type="text"
                value={current.title || ""}
                onChange={(e) =>
                  handleLangChange(activeLang, "title", e.target.value)
                }
              />

              <label>İçerik</label>
              <PlaygroundApp
                key={activeLang}
                value={current.description || ""}
                onChange={(val) =>
                  handleLangChange(activeLang, "description", val)
                }
              />
            </div>
          </>
        )}

        <button onClick={handleSave} className="submitButton">
          KAYDET
        </button>
      </div>
    </Layout>
  );
}
