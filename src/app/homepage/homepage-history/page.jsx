"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import imageCompression from "browser-image-compression";
import styles from "./homepage-history.module.css";
import Layout from "@/components/Layout";

export default function HomepageHistory() {
  const [data, setData] = useState({});
  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/homepage/history");
        const json = await res.json();
        const langs = Object.keys(json.data || {});
        const filled = {};
        langs.forEach((lang) => {
          filled[lang] = {
            top_title: json.data[lang]?.top_title || "",
            main_title: json.data[lang]?.main_title || "",
            items: json.data[lang]?.items || [],
          };
        });
        setData(filled);
        setLanguages(langs);
        setActiveLang(langs[0] || "tr");
      } catch (err) {
        console.error("Veri alınamadı:", err);
      }
    };
    fetchData();
  }, []);

  const handleHeaderChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [field]: value,
      },
    }));
  };

  const handleChange = (index, field, value) => {
    const updated = { ...data };
    updated[activeLang].items[index][field] = value;
    setData(updated);
  };

  const handleImageChange = async (index, file) => {
    if (!file) return;
    try {
      setUploadingIndex(index);
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
      });
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await res.json();
      const updated = { ...data };
      updated[activeLang].items[index].image_url = url;
      setData(updated);
    } catch (err) {
      console.error("Görsel yükleme hatası:", err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const addCard = () => {
    setData((prev) => {
      const updated = { ...prev };
      updated[activeLang].items.push({
        item_index: updated[activeLang].items.length + 1,
        title: "",
        history: "",
        image_url: "",
      });
      return updated;
    });
  };

  const removeCard = (index) => {
    setData((prev) => {
      const updated = { ...prev };
      updated[activeLang].items.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async () => {
    const token = Cookies.get("token");
    try {
      Swal.fire({ title: "Kaydediliyor...", didOpen: () => Swal.showLoading() });

      const payload = {
        section_key: "history",
        data,
      };

      const res = await fetch("/api/homepage/history", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("PUT başarısız");

      Swal.fire({ icon: "success", title: "Başarılı", text: "Veriler güncellendi." });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Hata", text: "Veriler güncellenemedi." });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Tarihçe Yönetimi</h1>

        <div className={styles.langTabs}>
          {languages.map((lang) => (
            <button
              key={lang}
              className={`${styles.langTab} ${lang === activeLang ? styles.active : ""}`}
              onClick={() => setActiveLang(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.headerSection}>
          <label>Üst Başlık</label>
          <input
            value={data[activeLang]?.top_title || ""}
            onChange={(e) => handleHeaderChange("top_title", e.target.value)}
          />
          <label>Ana Başlık</label>
          <input
            value={data[activeLang]?.main_title || ""}
            onChange={(e) => handleHeaderChange("main_title", e.target.value)}
          />
        </div>

        {data[activeLang]?.items?.map((item, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{i + 1}. Kart</h3>
              <button onClick={() => removeCard(i)}>Sil</button>
            </div>
            <input
              placeholder="Başlık"
              value={item.title}
              onChange={(e) => handleChange(i, "title", e.target.value)}
            />
            <textarea
              placeholder="Tarihçe"
              value={item.history}
              onChange={(e) => handleChange(i, "history", e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => handleImageChange(i, e.target.files[0])}
              disabled={uploadingIndex === i}
            />
            {item.image_url && (
              <img src={item.image_url} alt="Önizleme" className={styles.preview} />
            )}
          </div>
        ))}

        <button onClick={addCard}>+ Kart Ekle</button>
        <button onClick={handleSubmit}>Kaydet</button>
      </div>
    </Layout>
  );
}
