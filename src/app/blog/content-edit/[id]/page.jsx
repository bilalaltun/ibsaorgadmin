"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import styles from "./BlogContentEditPage.module.css";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
const SimpleEditor = dynamic(() => import("@/package/App"), { ssr: false });

export default function BlogContentEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [staticFields, setStaticFields] = useState({
    link: "",
    thumbnail: "",
    date: "",
    author: "",
    isactive: false,
    show_at_home: false,
    tags: [],
  });

  const [multiLangData, setMultiLangData] = useState({});

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/languages");
        if (!res.ok) throw new Error("Diller alınamadı");
        const data = await res.json();
        const langs = data.map((l) => l.name);
        setLanguages(langs);
        setActiveLang(langs[0]);

        const initial = langs.reduce((acc, lang) => {
          acc[lang] = {
            title: "",
            details: "",
            content: "",
            category: "",
          };
          return acc;
        }, {});
        setMultiLangData(initial);
      } catch (err) {
        console.error("Dil verisi alınamadı:", err);
        setError("Dil verisi alınamadı.");
        setLoading(false);
      }
    }

    fetchLanguages();
  }, []);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı");
        const data = await res.json();

        setStaticFields({
          link: data.link || "",
          thumbnail: data.thumbnail || "",
          date: data.date?.split("T")[0] || "",
          author: data.author || "",
          show_at_home: data.show_at_home,
          isactive: data.isactive,
          tags: (data.tags || []).join(", "),
        });

        const langData = {};
        languages.forEach((lang) => {
          langData[lang] = {
            title: data.title?.[lang] || "",
            details: data.details?.[lang] || "",
            content: data.content?.[lang] || "",
            category: data.category?.[lang] || "",
          };
        });

        setMultiLangData(langData);
      } catch (err) {
        console.error("❌ Blog yüklenemedi:", err);
        setError("Blog verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }

    if (languages.length > 0) fetchBlog();
  }, [id, languages]);

  const handleStaticChange = (key, value) => {
    setStaticFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (lang, key, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }));
  };

  const isFormValid = () => {
    const { link, thumbnail, date, author } = staticFields;
    if (!link || !thumbnail || !date || !author) return false;

    return languages.every((lang) => {
      const d = multiLangData[lang];
      return d.title.trim() && d.details.trim() && d.content.trim();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Alanlar",
        text: "Lütfen tüm alanları doldurduğunuzdan emin olun.",
      });
      return;
    }

    const payload = {
      link: staticFields.link,
      thumbnail: staticFields.thumbnail,
      date: staticFields.date,
      author: staticFields.author,
      isactive: staticFields.isactive,
      show_at_home: staticFields.show_at_home,
      title: {},
      details: {},
      content: {},
      category: {},
      tags: [],
    };

    payload.title = languages.map((lang) => ({
      langCode: lang,
      value: multiLangData[lang]?.title || "",
    }));

    payload.details = languages.map((lang) => ({
      langCode: lang,
      value: multiLangData[lang]?.details || "",
    }));

    payload.content = languages.map((lang) => ({
      langCode: lang,
      value: multiLangData[lang]?.content || "",
    }));

    payload.category = languages.map((lang) => ({
      langCode: lang,
      value: multiLangData[lang]?.category || "",
    }));

    payload.tags =
      typeof staticFields?.tags === "string"
        ? staticFields.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

    Swal.fire({
      title: "Kaydediliyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/blogs?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: `Blog #${id} başarıyla güncellendi.`,
      }).then(() => router.push("/blog"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Kaydetme sırasında bir hata oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang] || {};

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>📄 Blog</h1>

        {loading ? (
          <div className={"loadingSpinner"}>
            <div className={"spinner"} />
            <p>İçerikler yükleniyor...</p>
          </div>
        ) : (
          <div className={styles.editForm}>
            {error && <p className={styles.errorText}>{error}</p>}

            <section className={styles.section}>
              <h2>Sabit Alanlar</h2>

              <label>Kapak Fotoğrafı</label>
              <UploadField
                type="image"
                accept="image/*"
                label="Kapak Görseli Seç"
                value={staticFields.thumbnail}
                onChange={(url) => handleStaticChange("thumbnail", url)}
                disabled={false}
                multiple={false}
              />

              <label>Tarih</label>
              <input
                type="date"
                value={staticFields.date}
                onChange={(e) => handleStaticChange("date", e.target.value)}
              />

              <label>Yazar</label>
              <input
                type="text"
                value={staticFields.author}
                onChange={(e) => handleStaticChange("author", e.target.value)}
              />

              <label>Etiketler (virgülle)</label>
              <input
                type="text"
                value={staticFields.tags}
                onChange={(e) => handleStaticChange("tags", e.target.value)}
              />
            </section>

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
                value={current.title || ""}
                onChange={(e) =>
                  handleLangChange(activeLang, "title", e.target.value)
                }
              />

              <label>Detay</label>
              <input
                type="text"
                value={current.details || ""}
                onChange={(e) =>
                  handleLangChange(activeLang, "details", e.target.value)
                }
              />

              <label>Kontent</label>
              <SimpleEditor
                key={activeLang}
                value={current.content || ""}
                onChange={(e) => handleLangChange(activeLang, "content", e)}
              />
            </section>

            <button onClick={handleSubmit} className={styles.submitButton}>
              Kaydet
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
