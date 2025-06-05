"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateReferansPage() {
  const router = useRouter();
  const imageRef = useRef();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});
  const [form, setForm] = useState({
    img: "",
    isactive: true,
    show_at_home: true,
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
      form.img &&
      languages.every((lang) => multiLangData[lang]?.trim().length > 0)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanları doldurun.", "warning");
      return;
    }

    const name = languages.map((lang) => ({
      value: multiLangData[lang],
      langCode: lang,
    }));

    const payload = {
      img: form.img,
      isactive: form.isactive,
      show_at_home: form.show_at_home,
      name,
    };

    Swal.fire({
      title: "Kaydediliyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/references", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Referans eklendi.", "success").then(() => {
        router.push("/references");
      });
    } catch {
      Swal.fire("Hata", "Kayıt başarısız oldu.", "error");
    }
  };

  const current = multiLangData[activeLang] || "";

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Referans Ekle</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Görsel</label>
          <UploadField
            ref={imageRef}
            type="image"
            accept="image/*"
            value={form.img}
            onChange={(url) => handleChange("img", url)}
            label="Görsel Yükle"
          />

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

              <label>İsim ({activeLang.toUpperCase()})</label>
              <input
                type="text"
                className={styles.input}
                value={current}
                onChange={(e) => handleLangChange(activeLang, e.target.value)}
              />
            </section>
          )}

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
