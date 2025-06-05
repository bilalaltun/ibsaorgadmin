"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./EditExperienceTwoPage.module.css";

export default function EditExperienceTwoPage() {
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
          acc[lang] = {
            globalTitle: "",
            globalSubtitle: "",
            yearsExperience: "",
            exportCountries: "",
            videolink: "",
          };
          return acc;
        }, {});
        setMultiLangData(initialLangData);
      } catch (err) {
        console.error("Dil verisi alınamadı:", err);
      }
    }

    fetchLanguages();
  }, []);

  const fetchExperienceData = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/homepage/experience-two");
      const data = await res.json();

      if (data && data.experienceTwo) {
        const updated = { ...multiLangData };
        Object.keys(data.experienceTwo).forEach((lang) => {
          updated[lang] = {
            globalTitle: data.experienceTwo[lang]?.globalTitle || "",
            globalSubtitle: data.experienceTwo[lang]?.globalSubtitle || "",
            yearsExperience: data.experienceTwo[lang]?.yearsExperience || "",
            exportCountries: data.experienceTwo[lang]?.exportCountries || "",
            videolink: data.experienceTwo[lang]?.videolink || "",
          };
        });
        setMultiLangData(updated);
      }
    } catch (err) {
      console.error("ExperienceTwo verisi alınamadı:", err);
    }
  };

  useEffect(() => {
    if (languages.length > 0) fetchExperienceData();
  }, [languages]);

  const handleLangChange = (lang, field, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const handleSave = async () => {
    const token = Cookies.get("token");

    const translations = languages.map((lang) => ({
      langCode: lang,
      ...multiLangData[lang],
    }));

    const hasEmptyField = translations.some(
      (t) =>
        !t.globalTitle.trim() ||
        !t.globalSubtitle.trim() ||
        !t.yearsExperience.trim() ||
        !t.exportCountries.trim() ||
        !t.videolink.trim()
    );

    if (hasEmptyField) {
      Swal.fire("Eksik Bilgi", "Tüm alanlar doldurulmalıdır.", "warning");
      return;
    }

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch("http://localhost:3000/api/homepage/experience-two", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ translations }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız oldu.");

      await fetchExperienceData(); // günceli çek

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Veriler güncellendi.",
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
        <h2 className={styles.title}>Anasayfa Deneyimler Alanıı</h2>

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
              <label>Global Başlık</label>
              <input
                type="text"
                value={current.globalTitle || ""}
                onChange={(e) => handleLangChange(activeLang, "globalTitle", e.target.value)}
              />

              <label>Global Alt Başlık</label>
              <input
                type="text"
                value={current.globalSubtitle || ""}
                onChange={(e) => handleLangChange(activeLang, "globalSubtitle", e.target.value)}
              />

              <label>Yıllık Deneyim</label>
              <input
                type="text"
                value={current.yearsExperience || ""}
                onChange={(e) => handleLangChange(activeLang, "yearsExperience", e.target.value)}
              />

              <label>İhracat Yapılan Ülkeler</label>
              <input
                type="text"
                value={current.exportCountries || ""}
                onChange={(e) => handleLangChange(activeLang, "exportCountries", e.target.value)}
              />

              <label>Video Link</label>
              <input
                type="text"
                value={current.videolink || ""}
                onChange={(e) => handleLangChange(activeLang, "videolink", e.target.value)}
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
