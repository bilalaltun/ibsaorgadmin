"use client";

import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import langs from "@/data/langs";
import styles from "./styles.module.css";
import MultiLangTabManager from "@/components/MultiLangTabManager/MultiLangTabManager";
import Cookies from "js-cookie";

export default function CreateProductPage() {
  const imageRefCover = useRef();
  const imageRefExtra = useRef();
  const [tabRows, setTabRows] = useState([]);
  const [editorContent, setEditorContent] = useState("");

  const [form, setForm] = useState({
    link: "",
    category_key: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    used_services: "",
    used_applications: "",
    image_cover: "",
    image_extra: "",
  });

  const [activeLang, setActiveLang] = useState(langs[0]);
  const [multiLangData, setMultiLangData] = useState(() =>
    langs.reduce((acc, lang) => {
      acc[lang] = {
        project_name: "",
        description: "",
        tab_title: "",
        tab_content: "",
      };
      return acc;
    }, {})
  );

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (lang, key, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }));
  };

  const isFormValid = () => {
    return (
      form.link.trim() &&
      form.image_cover &&
      form.image_extra &&
      langs.every((lang) => multiLangData[lang].project_name.trim())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Zorunlu alanlar ve başlıklar doldurulmalı.",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const project_name = {},
      category = {},
      description = {},
      tabs = {};
    langs.forEach((lang) => {
      const entry = multiLangData[lang];
      project_name[lang] = entry.project_name;
      category[lang] = form.category_key;
      description[lang] = [entry.description];
      tabs[lang] = [
        {
          title: entry.tab_title,
          content: entry.tab_content,
        },
      ];
    });

    formData.append("project_name", JSON.stringify(project_name));
    formData.append("category", JSON.stringify(category));
    formData.append("description", JSON.stringify(description));
    formData.append("tabs", JSON.stringify(tabs));

    Swal.fire({
      title: "Ürün ekleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Ekleme başarısız");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Ürün başarıyla eklendi.",
      });

      setForm({
        link: "",
        category_key: "",
        meta_title: "",
        meta_keywords: "",
        meta_description: "",
        used_services: "",
        used_applications: "",
        image_cover: "",
        image_extra: "",
      });
      setMultiLangData(() =>
        langs.reduce((acc, lang) => {
          acc[lang] = {
            project_name: "",
            description: "",
            tab_title: "",
            tab_content: "",
          };
          return acc;
        }, {})
      );

      if (imageRefCover.current) imageRefCover.current.reset();
      if (imageRefExtra.current) imageRefExtra.current.reset();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Ürün kaydedilirken sorun oluştu.",
      });
    }
  };

  const current = multiLangData[activeLang];

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Ürün Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Kapak Görseli</label>
            <UploadField
              type="image"
              ref={imageRefCover}
              accept="image/*"
              label="Kapak Görseli Seç"
              value={form.image_cover}
              onChange={(url) => handleFormChange("image_cover", url)}
            />

            <label>Destek Görseli</label>
            <UploadField
              type="image"
              ref={imageRefExtra}
              accept="image/*"
              label="Ekstra Görsel Seç"
              value={form.image_extra}
              onChange={(url) => handleFormChange("image_extra", url)}
            />

            <label>Link</label>
            <input
              type="text"
              className={styles.input}
              value={form.link}
              onChange={(e) => handleFormChange("link", e.target.value)}
            />

            {[
              ["Kategori Key", "category_key"],
              ["Meta Title", "meta_title"],
              ["Meta Keywords", "meta_keywords"],
              ["Meta Description", "meta_description"],
              ["Kullanılan Hizmetler", "used_services"],
              ["Kullanılan Uygulamalar", "used_applications"],
            ].map(([label, key]) => (
              <div key={key}>
                <label>{label}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form[key]}
                  onChange={(e) => handleFormChange(key, e.target.value)}
                />
              </div>
            ))}
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
              value={current.project_name}
              onChange={(e) =>
                handleLangChange(activeLang, "project_name", e.target.value)
              }
            />

            <label>Açıklama</label>
            <textarea
              value={current.description}
              onChange={(e) =>
                handleLangChange(activeLang, "description", e.target.value)
              }
            />

            <MultiLangTabManager tabs={tabRows} setTabs={setTabRows} />
          </section>

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
