"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import styles from "./styles.module.css";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function CreatePage() {
  const { id } = useParams();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    image_url: "",
    video_url: "",
    dynamic_link_title: "",
    dynamic_link: "",
    dynamic_link_alternative: "",
    order: 0,
    isactive: true,
  });

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const langRes = await fetch("/api/languages");
        const langs = await langRes.json();
        setLanguages(langs);
        setActiveLang(langs[0]?.name || "");

        const initialData = {};
        langs.forEach((lang) => {
          initialData[lang.name] = {
            title: "",
            description: "",
            content: "",
          };
        });
        setMultiLangData(initialData);

        const menuRes = await fetch("/api/menus");
        const menuData = await menuRes.json();
        setMenus(menuData.data || []);

        if (id) {
          const res = await fetch(`/api/sliders?id=${id}`);
          if (!res.ok) throw new Error("Slider verisi alınamadı");
          const data = await res.json();

          setForm((prev) => ({
            ...prev,
            ...data,
          }));

          const filledLangData = {};
          langs.forEach((lang) => {
            filledLangData[lang.name] = {
              title: data.titles?.[lang.name] || "",
              description: data.descriptions?.[lang.name] || "",
              content: data.contents?.[lang.name] || "",
            };
          });
          setMultiLangData(filledLangData);
        }
      } catch (err) {
        console.error("Veri alınırken hata oluştu:", err);
      }
    }

    fetchInitialData();
  }, [id]);

  const handleLangChange = (lang, field, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return (
      form.image_url.trim() &&
      languages.every((lang) => {
        const entry = multiLangData[lang.name];
        return (
          entry.title.trim() && entry.description.trim() && entry.content.trim()
        );
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Tüm alanları doldurun.",
      });
      return;
    }

    const titles = languages.map((lang) => ({
      langCode: lang.name,
      value: multiLangData[lang.name].title,
    }));

    const description = languages.map((lang) => ({
      langCode: lang.name,
      value: multiLangData[lang.name].description,
    }));

    const content = languages.map((lang) => ({
      langCode: lang.name,
      value: multiLangData[lang.name].content,
    }));

    const payload = {
      ...form,
      titles,
      description,
      content,
    };

    const { id } = payload;

    Swal.fire({
      title: "Yükleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/sliders?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız oldu");

      Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Slider güncellendi.",
      }).then(() => {
        window.location.href = "/slider";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Güncelleme sırasında bir hata oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang] || {};

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Slider Güncelle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
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

          <label>Dynamic Link Title</label>
          <input
            className={styles.input}
            type="text"
            value={form.dynamic_link_title}
            onChange={(e) =>
              handleFormChange("dynamic_link_title", e.target.value)
            }
          />

          <label>Dynamic Link</label>
          <input
            className={styles.input}
            type="text"
            value={form.dynamic_link}
            onChange={(e) => handleFormChange("dynamic_link", e.target.value)}
          />

          <label>Dynamic Link Alternative</label>
          <input
            className={styles.input}
            type="text"
            value={form.dynamic_link_alternative}
            onChange={(e) =>
              handleFormChange("dynamic_link_alternative", e.target.value)
            }
          />

          <div className={styles.langTabs}>
            {languages.map((lang) => (
              <button
                key={lang.name}
                type="button"
                className={`${styles.input} ${
                  activeLang === lang.name ? styles.active : ""
                }`}
                onClick={() => setActiveLang(lang.name)}
              >
                {lang.name.toUpperCase()}
              </button>
            ))}
          </div>

          <label>Başlık ({activeLang.toUpperCase()})</label>
          <input
            className={styles.input}
            value={current.title || ""}
            onChange={(e) =>
              handleLangChange(activeLang, "title", e.target.value)
            }
          />

          <label>Açıklama ({activeLang.toUpperCase()})</label>
          <textarea
            rows={2}
            className={styles.input}
            value={current.description || ""}
            onChange={(e) =>
              handleLangChange(activeLang, "description", e.target.value)
            }
          />

          <label>İçerik ({activeLang.toUpperCase()})</label>
          <textarea
            rows={4}
            className={styles.input}
            value={current.content || ""}
            onChange={(e) =>
              handleLangChange(activeLang, "content", e.target.value)
            }
          />

          <button type="submit" className={styles.submitButton}>
            GÜNCELLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
