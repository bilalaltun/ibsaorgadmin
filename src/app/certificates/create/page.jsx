"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import UploadField from "@/components/UploadField/UploadField";
import styles from "./styles.module.css";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";

export default function CreateCertificate() {
  const router = useRouter();
  const imageRef = useRef();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});
  const [form, setForm] = useState({
    img: "",
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
          acc[lang] = "";
          return acc;
        }, {});
        setMultiLangData(initialLangData);
      } catch (err) {
        console.error("Dil verisi alınamadı:", err);
      }
    }

    fetchLanguages();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (lang, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const isFormValid = () => {
    return (
      form.img.trim() &&
      languages.every((lang) => multiLangData[lang]?.trim())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanları doldurmalısınız.", "warning");
      return;
    }

    const title = languages.map((lang) => ({
      value: multiLangData[lang],
      langCode: lang,
    }));

    const payload = {
      img: form.img,
      title,
      date: new Date().toISOString().slice(0, 10),
      isactive: true,
    };

    Swal.fire({
      title: "Kaydediliyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Sertifika eklendi.", "success").then(() => {
        router.push("/certificates");
      });
    } catch (err) {
      Swal.fire("Hata", "Bir sorun oluştu.", "error");
    }
  };

  const current = multiLangData[activeLang] || "";

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>📄 Sertifika Ekle</h1>
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <section className={styles.section}>
            <h2>Sertifika Bilgileri</h2>

            <label>Görsel</label>
            <UploadField
              ref={imageRef}
              type="image"
              label="Görsel Yükle"
              value={form.img}
              onChange={(url) => handleChange("img", url)}
              accept="image/*"
              multiple={false}
            />

            {languages.length > 0 && (
              <>
                <div className={styles.langTabs}>
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={activeLang === lang ? styles.active : ""}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                <label>Başlık ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  value={current}
                  onChange={(e) =>
                    handleLangChange(activeLang, e.target.value)
                  }
                />
              </>
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
