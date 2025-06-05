// CreateTitle.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";

const langs = ["tr", "en", "ar"];

export default function CreateTitle() {
  const router = useRouter();
  const [activeLang, setActiveLang] = useState("tr");

  const [multiLangData, setMultiLangData] = useState(() =>
    langs.reduce((acc, lang) => {
      acc[lang] = "";
      return acc;
    }, {})
  );

  const handleChange = (lang, value) => {
    setMultiLangData((prev) => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (langs.some((lang) => !multiLangData[lang].trim())) {
      Swal.fire("Uyarı", "Tüm dillerde başlık girilmelidir.", "warning");
      return;
    }

    Swal.fire({
      title: "Kaydediliyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/sitetags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: multiLangData }),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Başlık başarıyla eklendi.", "success").then(() => {
        router.push("/etikets");
      });
    } catch {
      Swal.fire("Hata", "Kayıt sırasında bir hata oluştu.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>📄 Yeni Başlık Ekle</h1>
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <section className={styles.section}>
            <div className={styles.langTabs}>
              {langs.map((lang) => (
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

            <h2>{activeLang.toUpperCase()} Başlığı</h2>
            <input
              type="text"
              value={multiLangData[activeLang]}
              onChange={(e) => handleChange(activeLang, e.target.value)}
            />
          </section>
          <button type="submit" className={styles.submitButton}>
            EKLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
