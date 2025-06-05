"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./CreateBlogPage.module.css";

const PlaygroundApp = dynamic(() => import("@/package/App"), { ssr: false });

export default function CreateBlogPage() {
  const imageRef = useRef();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});

  const [form, setForm] = useState({
    link: "",
    thumbnail: "",
    date: new Date().toISOString().slice(0, 10),
    author: "",
    isactive: false,
    show_at_home: false,
    tags: "",
  });

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

        const initialLangData = langs.reduce((acc, lang) => {
          acc[lang] = { title: "", details: "", content: "", category: "" };
          return acc;
        }, {});
        setMultiLangData(initialLangData);
      } catch (err) {
        console.error("Dil verisi alınamadı:", err);
      }
    }

    fetchLanguages();
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
      form.link.trim() &&
      form.thumbnail.trim() &&
      form.author.trim() &&
      form.tags.trim() &&
      languages.every(
        (lang) =>
          multiLangData[lang].title.trim() &&
          multiLangData[lang].details.trim() &&
          multiLangData[lang].content.trim()
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Tüm alanlar ve diller doldurulmalı.",
      });
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const title = [];
    const details = [];
    const content = [];
    const category = [];

    languages.forEach((lang) => {
      const entry = multiLangData[lang];
      title.push({ value: entry.title, langCode: lang });
      details.push({ value: entry.details, langCode: lang });
      content.push({ value: entry.content, langCode: lang });
      category.push({ value: entry.category, langCode: lang });
    });

    const payload = {
      ...form,
      tags,
      title,
      details,
      content,
      category,
    };

    Swal.fire({
      title: "Blog ekleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Blog eklenemedi.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Blog başarıyla eklendi.",
      }).then(() => {
        window.location.href = "blog";
      });

      // reset
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Blog kaydedilirken bir sorun oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang] || {};

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Blog Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Kapak Görseli</label>
            <UploadField
              type="image"
              ref={imageRef}
              accept="image/*"
              label="Görsel Yükle"
              value={form.thumbnail}
              onChange={(url) => handleFormChange("thumbnail", url)}
            />

            <label>Link</label>
            <input
              type="text"
              className={styles.input}
              placeholder="yazilar/akilli-otomat"
              value={form.link}
              onChange={(e) => {
                const rawValue = e.target.value;
                const sanitizedValue = rawValue
                  .toLowerCase()
                  .replace(/[^a-z0-9\-\/]/g, "");
                handleFormChange("link", sanitizedValue);
              }}
            />

            <label>Tarih</label>
            <input
              type="date"
              className={styles.input}
              value={form.date}
              onChange={(e) => handleFormChange("date", e.target.value)}
            />

            <label>Yazar</label>
            <input
              type="text"
              className={styles.input}
              value={form.author}
              onChange={(e) => handleFormChange("author", e.target.value)}
            />

            <label>Etiketler (virgülle)</label>
            <input
              type="text"
              className={styles.input}
              value={form.tags}
              onChange={(e) => handleFormChange("tags", e.target.value)}
            />
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

              <label>Detay</label>
              <input
                type="text"
                value={current.details}
                onChange={(e) =>
                  handleLangChange(activeLang, "details", e.target.value)
                }
              />

              <label>Kontent</label>
              <PlaygroundApp
                key={`${activeLang}`}
                value={current.content}
                onChange={(val) => handleLangChange(activeLang, "content", val)}
              />
            </section>
          )}

          <button
            type="submit"
            className={"submitButton"}
            disabled={!isFormValid()}
          >
            EKLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
