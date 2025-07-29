"use client";

import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function CreateUserManualPage() {
  const imageRef = useRef();
  const fileRefs = useRef({});
  const [langs, setLangs] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");

  const [form, setForm] = useState({
    cover_img: "",
    titles: {},
    files: {},
  });

  useEffect(() => {
    const fetchLangs = async () => {
      const res = await fetch("/api/languages");
      const data = await res.json();
      setLangs(data);
      setActiveLang(data?.[0]?.name || "tr");

      const titles = {};
      const files = {};
      data.forEach((lang) => {
        titles[lang.name] = "";
        files[lang.name] = "";
        fileRefs.current[lang.name] = null;
      });

      setForm({ cover_img: "", titles, files });
    };

    fetchLangs();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (type, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [lang]: value,
      },
    }));
  };

  const isFormValid = () => {
    return (
      form.cover_img.trim() &&
      langs.every((lang) => form.titles[lang.name] && form.files[lang.name])
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Lütfen tüm alanları doldurun.",
      });
      return;
    }

    Swal.fire({
      title: "Kullanım Kılavuzu ekleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const translations = langs.map((lang) => ({
      lang_code: lang.name,
      title: form.titles[lang.name],
      file: form.files[lang.name],
    }));

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/usermanual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cover_img: form.cover_img,
          isactive: true,
          translations,
        }),
      });

      if (!res.ok) throw new Error("Kullanım Kılavuzu eklenemedi.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Kullanım Kılavuzu başarıyla eklendi.",
      }).then(() => {
        window.location.href = "/usermanual";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Kaydetme sırasında bir hata oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Kullanım Kılavuzu Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Kapak Görseli</label>
            <UploadField
              ref={imageRef}
              type="image"
              accept="image/*"
              value={form.cover_img}
              label="Kapak Yükle"
              onChange={(url) => handleChange("cover_img", url)}
            />

            {/* Tabs */}
            <div className={styles.langTabs}>
              {langs.map((lang) => (
                <button
                  type="button"
                  key={lang.name}
                  className={`${styles.tabButton} ${
                    activeLang === lang.name ? styles.active : ""
                  }`}
                  onClick={() => setActiveLang(lang.name)}
                >
                  {lang.name.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Active Language Fields */}
            {activeLang && (
              <div className={styles.langFields}>
                <label>Başlık ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.titles[activeLang] || ""}
                  onChange={(e) =>
                    handleLangChange("titles", activeLang, e.target.value)
                  }
                />

                <label>PDF Dosya ({activeLang.toUpperCase()})</label>
                <UploadField
                  ref={(el) => (fileRefs.current[activeLang] = el)}
                  key={activeLang}
                  type="file"
                  accept="*"
                  value={form.files[activeLang] || ""}
                  label={`${activeLang.toUpperCase()} PDF Yükle`}
                  onChange={(url) => handleLangChange("files", activeLang, url)}
                />
              </div>
            )}
          </section>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
          >
            EKLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
