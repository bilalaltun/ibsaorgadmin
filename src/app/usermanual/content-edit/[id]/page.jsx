"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditUserManualPage() {
  const { id } = useParams();
  const router = useRouter();
  const imageRef = useRef();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");

  const [form, setForm] = useState({
    cover_img: "",
    isactive: true,
    translations: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dilleri getir
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/languages");
        const data = await res.json();
        const langs = data.map((l) => l.name);
        setLanguages(langs);
        setActiveLang(langs[0] || "tr");
      } catch (err) {
        Swal.fire("Hata", "Diller yüklenemedi", "error");
      }
    }
    fetchLanguages();
  }, []);

  // Kılavuz verisini getir
  useEffect(() => {
    async function fetchManual() {
      try {
        const res = await fetch(`/api/usermanual?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı.");
        const data = await res.json();

        const translationsObj = {};
        data.translations?.forEach((t) => {
          translationsObj[t.lang_code] = {
            title: t.title || "",
            file: t.file || "",
          };
        });

        setForm({
          cover_img: data.cover_img || "",
          isactive: data.isactive ?? true,
          translations: translationsObj,
        });
      } catch (err) {
        console.error("Veri alınamadı:", err);
        setError("Kullanım Kılavuzu bulunamadı.");
      } finally {
        setLoading(false);
      }
    }

    if (languages.length > 0) {
      fetchManual();
    }
  }, [id, languages]);

  // Form güncelleyiciler
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTranslationChange = (lang, key, value) => {
    setForm((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [key]: value,
        },
      },
    }));
  };

  const isFormValid = () => {
    if (!form.cover_img) return false;
    return languages.every(
      (lang) =>
        form.translations[lang]?.title?.trim() &&
        form.translations[lang]?.file?.trim()
    );
  };

  const preparePayload = () => {
    const translationsArray = languages.map((lang) => ({
      lang_code: lang,
      title: form.translations[lang]?.title || "",
      file: form.translations[lang]?.file || "",
    }));

    return {
      cover_img: form.cover_img,
      isactive: form.isactive,
      translations: translationsArray,
    };
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Tüm başlıklar ve dosyalar zorunludur.",
      });
      return;
    }

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/usermanual?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preparePayload()),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Kılavuz güncellendi.",
      }).then(() => router.push("/usermanual"));
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Güncelleme sırasında bir hata oluştu.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Kullanım Kılavuzu Düzenle </h2>

        {loading ? (
          <div className="loadingSpinner">Yükleniyor...</div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>Kapak Görseli</label>
            <UploadField
              ref={imageRef}
              type="image"
              accept="image/*"
              value={form.cover_img}
              label="Görsel Seç"
              onChange={(url) => handleChange("cover_img", url)}
            />
            <div className={styles.section}>
              <div className={styles.langTabs}>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={` ${activeLang === lang ? styles.active : ""}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className={styles.langFields}>
                <label>Başlık ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.translations[activeLang]?.title || ""}
                  onChange={(e) =>
                    handleTranslationChange(activeLang, "title", e.target.value)
                  }
                />

                <label>Dosya ({activeLang.toUpperCase()})</label>
                <UploadField
                  type="file"
                  accept="*"
                  value={form.translations[activeLang]?.file || ""}
                  label="PDF Yükle"
                  onChange={(url) =>
                    handleTranslationChange(activeLang, "file", url)
                  }
                />
              </div>
            </div>
            <button
              type="submit"
              className="submitButton"
              disabled={!isFormValid()}
            >
              GÜNCELLE
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
