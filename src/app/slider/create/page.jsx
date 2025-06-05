"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import styles from "./CreateSliderPage.module.css";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function CreateSliderPage() {
  const [form, setForm] = useState({
    image_url: "",
    video_url: "",
    order: 9999,
    isActive: true,
    dynamic_link_title: "",
    dynamic_link: "",
    dynamic_link_alternative: "",
  });

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});

  // Dilleri çek
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/languages");
        if (!res.ok) throw new Error("Diller alınamadı.");
        const data = await res.json();

        const langs = data.map((l) => l.name);
        setLanguages(langs);
        setActiveLang(langs[0]);

        const initialData = langs.reduce((acc, lang) => {
          acc[lang] = { title: "", description: "", content: "" };
          return acc;
        }, {});
        setMultiLangData(initialData);
      } catch (err) {
        console.error("Dil verisi alınamadı:", err);
      }
    }

    fetchLanguages();
  }, []);

  // Slider order
  useEffect(() => {
    async function fetchSliderCount() {
      try {
        const res = await fetch("/api/sliders");
        if (!res.ok) throw new Error("Slider listesi alınamadı");
        const data = await res.json();
        data?.data?.length > 0
          ? setForm((prev) => ({ ...prev, order: data.data.length + 1 }))
          : setForm((prev) => ({ ...prev, order: 1 }));
      } catch (err) {
        console.error("Slider sırası belirlenemedi:", err);
      }
    }

    fetchSliderCount();
  }, []);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (lang, field, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const isFormValid = () => {
    return (
      (form.image_url || form.video_url) &&
      languages.every(
        (lang) =>
          multiLangData[lang]?.title.trim() &&
          multiLangData[lang]?.description.trim() &&
          multiLangData[lang]?.content.trim()
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Görsel ve tüm dil içerikleri zorunludur.",
      });
      return;
    }

    // API formatına uygun hale getir
    const titles = [];
    const description = [];
    const content = [];

    languages.forEach((langCode) => {
      const entry = multiLangData[langCode];
      titles.push({ value: entry.title, langCode });
      description.push({ value: entry.description, langCode });
      content.push({ value: entry.content, langCode });
    });

    const payload = {
      image_url: form.image_url,
      video_url: form.video_url,
      dynamic_link_title: form.dynamic_link_title || "test",
      dynamic_link: form.dynamic_link || "test",
      dynamic_link_alternative: form.dynamic_link_alternative || "test",
      order: form.order,
      isactive: form.isActive,
      titles,
      description,
      content,
    };

    Swal.fire({
      title: "Yükleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/sliders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Slider yüklenemedi.");

      Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Slider başarıyla oluşturuldu.",
      }).then(() => {
        window.location.href = "/slider";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Yükleme sırasında bir sorun oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang] || {};

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Slider Ekle</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <div className={styles.uploadWrapper}>
              <UploadField
                label="Görsel Ekle"
                type="image"
                accept="image/*"
                disabled={!!form.video_url}
                value={form.image_url}
                onChange={(url) => handleFormChange("image_url", url)}
              />
              <UploadField
                label="Video Ekle"
                type="video"
                accept="video/mp4"
                disabled={!!form.image_url}
                value={form.video_url}
                onChange={(url) => handleFormChange("video_url", url)}
              />
            </div>
          </section>

          {languages.length > 0 && (
            <section className={styles.section}>
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

              <h2>{activeLang.toUpperCase()} İçeriği</h2>

              <label>Başlık</label>
              <input
                type="text"
                value={current.title}
                onChange={(e) =>
                  handleLangChange(activeLang, "title", e.target.value)
                }
              />

              <label>Açıklama</label>
              <textarea
                rows={2}
                className={styles.input}
                value={current.description}
                onChange={(e) =>
                  handleLangChange(activeLang, "description", e.target.value)
                }
              />

              <label>İçerik</label>
              <textarea
                rows={3}
                className={styles.input}
                value={current.content}
                onChange={(e) =>
                  handleLangChange(activeLang, "content", e.target.value)
                }
              />
            </section>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            // disabled={!isFormValid()}
          >
            EKLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
