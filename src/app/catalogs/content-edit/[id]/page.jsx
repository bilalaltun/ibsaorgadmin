"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditCatalogPage() {
  const { id } = useParams();
  const router = useRouter();
  const imageRef = useRef();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");
  const [form, setForm] = useState({
    cover_img: "",
    title: {},
    files: {},
    isactive: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/languages");
        const data = await res.json();
        const langList = data.map((l) => l.name);
        setLanguages(langList);
        setActiveLang(langList[0] || "tr");
      } catch {
        Swal.fire("Hata", "Diller yüklenemedi", "error");
      }
    }
    fetchLanguages();
  }, []);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch(`/api/catalogs?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı.");
        const data = await res.json();

        const filledTitles = {};
        const filledFiles = {};
        languages.forEach((lang) => {
          filledTitles[lang] = data.title?.[lang] || "";
          filledFiles[lang] = data[`file_${lang}_img`] || "";
        });

        setForm({
          cover_img: data.cover_img || "",
          title: filledTitles,
          files: filledFiles,
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error("Katalog verisi alınamadı:", err);
        setError("Katalog bulunamadı.");
      } finally {
        setLoading(false);
      }
    }

    if (languages.length > 0) {
      fetchCatalog();
    }
  }, [id, languages]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangTitleChange = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: value,
      },
    }));
  };

  const handleLangFileChange = (lang, url) => {
    setForm((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [lang]: url,
      },
    }));
  };

  const isFormValid = () => {
    return (
      form.cover_img &&
      languages.every((lang) => form.title[lang]?.trim() && form.files[lang])
    );
  };

  const convertToArrayFormat = (obj) =>
    Object.entries(obj).map(([langCode, value]) => ({
      langCode,
      value,
    }));

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

    const payload = {
      cover_img: form.cover_img,
      isactive: form.isactive,
      title: convertToArrayFormat(form.title),
      files: convertToArrayFormat(form.files),
    };

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/catalogs?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Katalog güncellendi.",
      }).then(() => router.push("/catalogs"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Güncelleme sırasında hata oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Katalog Düzenle</h2>

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
                    type="button"
                    key={lang}
                    className={`${activeLang === lang ? styles.active : ""}`}
                    onClick={() => setActiveLang(lang)}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className={styles.langFields}>
                <label>Başlık ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  value={form.title[activeLang] || ""}
                  onChange={(e) =>
                    handleLangTitleChange(activeLang, e.target.value)
                  }
                />

                <label>Dosya ({activeLang.toUpperCase()})</label>
                <UploadField
                  type="file"
                  accept="*"
                  value={form.files[activeLang] || ""}
                  label={`${activeLang.toUpperCase()} PDF Yükle`}
                  onChange={(url) => handleLangFileChange(activeLang, url)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={"submitButton"}
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
