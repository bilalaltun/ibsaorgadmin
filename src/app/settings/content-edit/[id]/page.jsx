"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import langs from "@/data/langs";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function ProductContentEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeLang, setActiveLang] = useState("tr");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [staticFields, setStaticFields] = useState({
    image: "",
  });

  const [multiLangData, setMultiLangData] = useState(() =>
    langs.reduce((acc, lang) => {
      acc[lang] = {
        title: "",
        description: "",
        generalFeatures: "",
      };
      return acc;
    }, {})
  );

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Veri alınamadı");
        const data = await res.json();

        setStaticFields({
          image: data.image || "",
        });

        const langData = {};
        langs.forEach((lang) => {
          langData[lang] = {
            title: data.title?.[lang] || "",
            description: data.description?.[lang] || "",
            generalFeatures: data.generalFeatures?.[lang] || "",
          };
        });

        setMultiLangData(langData);
      } catch (err) {
        console.error("❌ Ürün yüklenemedi:", err);
        setError("Ürün verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

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
    const { image } = staticFields;
    if (!image) return false;

    return langs.every((lang) => {
      const d = multiLangData[lang];
      return d.title.trim() && d.description.trim() && d.generalFeatures.trim();
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
      id,
      image: staticFields.image,
      title: {},
      description: {},
      generalFeatures: {},
    };

    langs.forEach((lang) => {
      const entry = multiLangData[lang];
      payload.title[lang] = entry.title;
      payload.description[lang] = entry.description;
      payload.generalFeatures[lang] = entry.generalFeatures;
    });

    Swal.fire({
      title: "Kaydediliyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/products/${id}`, {
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
        text: `Ürün #${id} başarıyla güncellendi.`,
      }).then(() => router.push("/product"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Kaydetme sırasında bir hata oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang];

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>
          🛠️ Ürün #{id} – Çok Dilli İçerik Düzenleme
        </h1>

        {loading ? (
          <div className={"loadingSpinner"}>
            <div className={"spinner"} />
            <p>İçerikler yükleniyor...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            {error && <p className={styles.errorText}>{error}</p>}

            <section className={styles.section}>
              <h2>Sabit Alanlar</h2>

              <label>Kapak Fotoğrafı</label>
              <UploadField
                type="image"
                accept="image/*"
                label="Kapak Görseli Seç"
                value={staticFields.image}
                onChange={(url) => handleStaticChange("image", url)}
                disabled={false}
                multiple={false}
              />
            </section>

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
                rows={4}
                value={current.description}
                onChange={(e) =>
                  handleLangChange(activeLang, "description", e.target.value)
                }
              />

              <label>Genel Özellikler</label>
              <textarea
                rows={4}
                value={current.generalFeatures}
                onChange={(e) =>
                  handleLangChange(
                    activeLang,
                    "generalFeatures",
                    e.target.value
                  )
                }
              />
            </section>

            <button type="submit" className={styles.submitButton}>
              Kaydet
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
