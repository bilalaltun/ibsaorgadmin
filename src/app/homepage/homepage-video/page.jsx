// pages/homepage/EditVideoPage.jsx

"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./EditFacilitiesPage.module.css";

export default function EditVideoPage() {
  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");
  const [videoData, setVideoData] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/homepage/video");
        const data = await res.json();
        const langs = Object.keys(data.video);
        setLanguages(langs);
        setActiveLang(langs[0]);
        setVideoData(data.video);
      } catch (err) {
        console.error("Veri alınamadı", err);
      }
    }
    fetchData();
  }, []);

  const handleChange = (lang, field, value) => {
    setVideoData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const handleItemChange = (lang, index, field, value) => {
    const items = [...(videoData[lang].items || [])];
    items[index][field] = value;
    handleChange(lang, "items", items);
  };

  const addItem = (lang) => {
    const items = [...(videoData[lang].items || [])];
    items.push({ before: "", text: "" });
    handleChange(lang, "items", items);
  };

  const removeItem = (lang, index) => {
    const items = [...(videoData[lang].items || [])];
    items.splice(index, 1);
    handleChange(lang, "items", items);
  };

  const handleSubmit = async () => {
    const token = Cookies.get("token");
    try {
      Swal.fire({
        title: "Kaydediliyor...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        video: videoData,
      };

      const res = await fetch("/api/homepage/video", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Hata oluştu");

      Swal.fire({ icon: "success", title: "Başarılı", text: "Veriler güncellendi." });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Hata", text: "Bir hata oluştu." });
    }
  };

  const current = videoData[activeLang] || { items: [] };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Video Alanı</h2>

        <div className={styles.langTabs}>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={activeLang === lang ? styles.active : ""}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.section}>
          <label>Başlık</label>
          <input
            type="text"
            value={current.title || ""}
            onChange={(e) => handleChange(activeLang, "title", e.target.value)}
          />

          <label>YouTube Linki</label>
          <input
            type="text"
            value={current.youtube_link || ""}
            onChange={(e) => handleChange(activeLang, "youtube_link", e.target.value)}
          />
        </div>

        <h3>Animasyon Öğeleri</h3>
        {current.items.map((item, index) => (
          <div key={index} className={styles.itemGroup}>
            <h4>Öğe {index + 1}</h4>
            <label>Ön Metin</label>
            <input
              type="text"
              value={item.before}
              onChange={(e) => handleItemChange(activeLang, index, "before", e.target.value)}
            />
            <label>Metin</label>
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleItemChange(activeLang, index, "text", e.target.value)}
            />
            <button type="button" className={styles.removeButton} onClick={() => removeItem(activeLang, index)}>
              Öğeyi Sil
            </button>
          </div>
        ))}

        <button type="button" className={styles.addButton} onClick={() => addItem(activeLang)}>
          Öğe Ekle
        </button>

        <button className={styles.submitButton} onClick={handleSubmit}>
          KAYDET
        </button>
      </div>
    </Layout>
  );
}
