"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import imageCompression from "browser-image-compression";
import styles from "./homepage-success.module.css";

export default function HomepageSuccess() {
  const [data, setData] = useState({});
  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/homepage/success");
        const json = await res.json();
        const langs = Object.keys(json.data || {});

        // Dataları eksiksiz hale getir
        const filledData = {};
        langs.forEach((lang) => {
          filledData[lang] = {
            slider_title: json.data[lang]?.slider_title || "",
            main_title: json.data[lang]?.main_title || "",
            description: json.data[lang]?.description || "",
            items: json.data[lang]?.items || []
          };
        });

        setData(filledData);
        setLanguages(langs);
        setActiveLang(langs[0] || "tr");
      } catch (err) {
        console.error("Veri alınırken hata:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (languages.length && !data[activeLang]) {
      setData((prev) => ({
        ...prev,
        [activeLang]: {
          slider_title: "",
          main_title: "",
          description: "",
          items: []
        }
      }));
    }
  }, [activeLang]);

  const handleChange = (lang, index, field, value) => {
    const updated = { ...data };
    if (!updated[lang]?.items) return;
    updated[lang].items[index][field] = value;
    setData(updated);
  };

  const handleImageChange = async (lang, index, file) => {
    if (!file) return;
    try {
      setUploadingIndex(index);

      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Görsel yüklenemedi");

      const { url } = await res.json();
      const updated = { ...data };
      updated[lang].items[index].image_url = url;
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
      if (!updated[activeLang]) return prev;
      updated[activeLang].items = updated[activeLang].items || [];
      updated[activeLang].items.push({
        slider_index: updated[activeLang].items.length + 1,
        title: "",
        description: "",
        image_url: "",
      });
      return updated;
    });
  };

  const removeCard = (index) => {
    setData((prev) => {
      const updated = { ...prev };
      updated[activeLang].items = updated[activeLang].items.filter((_, i) => i !== index);
      return updated;
    });
  };

  const handleHeaderChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const token = Cookies.get("token");
    try {
      Swal.fire({ title: "Kaydediliyor...", didOpen: () => Swal.showLoading() });

      const payload = {
        section_key: "success", // sabit key
        data: data              // tüm dillerin verisi gönderiliyor
      };

      const res = await fetch("/api/homepage/success", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("PUT işlemi başarısız");

      Swal.fire({ icon: "success", title: "Başarılı", text: "Veriler kaydedildi." });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Hata", text: "Veriler kaydedilemedi." });
    }
  };


  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Başarı Hikayeleri</h1>

        <div className={styles.langTabs}>
          {languages.map((lang) => (
            <button
              key={lang}
              className={`${styles.langTab} ${activeLang === lang ? styles.active : ""}`}
              onClick={() => setActiveLang(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {data[activeLang] && (
          <div className={styles.headerSection}>
            <label className={styles.label}>Slider Başlığı</label>
            <input
              type="text"
              className={styles.inputField}
              value={data[activeLang].slider_title || ""}
              onChange={(e) => handleHeaderChange("slider_title", e.target.value)}
            />

            <label className={styles.label}>Ana Başlık</label>
            <input
              type="text"
              className={styles.inputField}
              value={data[activeLang].main_title || ""}
              onChange={(e) => handleHeaderChange("main_title", e.target.value)}
            />

            <label className={styles.label}>Açıklama</label>
            <textarea
              className={styles.textArea}
              rows={4}
              value={data[activeLang].description || ""}
              onChange={(e) => handleHeaderChange("description", e.target.value)}
            />
          </div>
        )}

        <div className={styles.cardList}>
          {Array.isArray(data[activeLang]?.items) &&
            data[activeLang].items.map((item, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{index + 1}. Kart</h3>
                  <button className={styles.removeBtn} onClick={() => removeCard(index)}>
                    Sil
                  </button>
                </div>

                <label className={styles.label}>Başlık</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleChange(activeLang, index, "title", e.target.value)}
                  className={styles.inputField}
                />

                <label className={styles.label}>Açıklama</label>
                <textarea
                  rows={3}
                  value={item.description}
                  onChange={(e) => handleChange(activeLang, index, "description", e.target.value)}
                  className={styles.textArea}
                />

                <label className={styles.label}>Görsel</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(activeLang, index, e.target.files[0])}
                  className={styles.fileInput}
                  disabled={uploadingIndex === index}
                />
                {item.image_url && (
                  <img src={item.image_url} alt="Önizleme" className={styles.previewImg} />
                )}
              </div>
            ))}
        </div>

        <button className={styles.addBtn} onClick={addCard}>+ Kart Ekle</button>
        <button className={styles.submitButton} onClick={handleSubmit}>Kaydet</button>
      </div>
    </Layout>
  );
}
