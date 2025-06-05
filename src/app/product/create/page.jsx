"use client";

import { useRef, useState, useEffect } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import MultiImageUploader from "@/components/MultiImageUpload/MultiImageUpload";
const SimpleEditor = dynamic(() => import("@/package/App"), {
  ssr: false,
});

export default function CreateProductPage() {
  const imageRefCover = useRef();
  const imageRefExtra = useRef();

  const [langs, setLangs] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [form, setForm] = useState({
    category_key: "",
    is_active: true,
    images: [],
    html: "",
  });
  const [multiLangData, setMultiLangData] = useState({});

  useEffect(() => {
    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => {
        const languageList = data.map((item) => item.name);
        setLangs(languageList);
        setActiveLang(languageList[0]);
        const langObj = {};
        languageList.forEach((lang) => {
          langObj[lang] = {
            project_name: "",
            category: "",
            description: [""],
            tabs: [{ title: "", content: "" }],
          };
        });
        setMultiLangData(langObj);
      });
  }, []);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (lang, key, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }));
  };

  const handleTabChange = (lang, index, field, value) => {
    const updated = [...multiLangData[lang].tabs];
    updated[index][field] = value;
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], tabs: updated },
    }));
  };

  const addTab = () => {
    setMultiLangData((prev) => {
      const updated = { ...prev };
      langs.forEach((lang) => {
        updated[lang] = {
          ...updated[lang],
          tabs: [...updated[lang].tabs, { title: "", content: "" }],
        };
      });
      return updated;
    });
  };

  const removeTab = (index) => {
    setMultiLangData((prev) => {
      const updated = { ...prev };
      langs.forEach((lang) => {
        const newTabs = [...updated[lang].tabs];
        newTabs.splice(index, 1);
        updated[lang] = {
          ...updated[lang],
          tabs: newTabs,
        };
      });
      return updated;
    });
  };

  const current = multiLangData[activeLang] || {};

  const isFormValid = () => {
    return true;
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

    const payload = {
      category_key: form.category_key,
      is_active: true,
      images: form.images,
      project_name: [],
      category: [],
      description: [],
      tabs: [],
    };

    langs.forEach((lang) => {
      const entry = multiLangData[lang];
      payload.project_name.push({ langCode: lang, value: entry.project_name });
      payload.category.push({ langCode: lang, value: entry.category });
      payload.description.push({
        langCode: lang,
        value: Array.isArray(entry.description)
          ? entry.description.join("")
          : entry.description,
      });
    });

    const maxTabs = Math.max(
      ...langs.map((lang) => multiLangData[lang].tabs.length)
    );
    for (let i = 0; i < maxTabs; i++) {
      const tab = { title: [], content: [] };
      langs.forEach((lang) => {
        const tabData = multiLangData[lang].tabs[i];
        if (tabData) {
          tab.title.push({ langCode: lang, value: tabData.title });
          tab.content.push({
            langCode: lang,
            value: `${tabData.content}<div id="extra-html-${i}" data-html="true">${form.html}</div>`,
          });
        }
      });
      payload.tabs.push(tab);
    }

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
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Ekleme başarısız");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Ürün başarıyla eklendi.",
      }).then(() => {
        window.location.href = "/product";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Ürün kaydedilirken sorun oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Ürün Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Görseller</label>
            <MultiImageUploader
              value={form.images}
              onChange={(fnOrArray) =>
                setForm((prev) => ({
                  ...prev,
                  images:
                    typeof fnOrArray === "function"
                      ? fnOrArray(prev.images)
                      : fnOrArray,
                }))
              }
            />
            <label>Kategori Anahtarı</label>
            <input
              type="text"
              className={styles.input}
              value={form.category_key}
              onChange={(e) => handleFormChange("category_key", e.target.value)}
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

            <h3>{activeLang.toUpperCase()} İçeriği</h3>

            <label>Ürün Adı</label>
            <input
              type="text"
              className={styles.input}
              value={current.project_name || ""}
              onChange={(e) =>
                handleLangChange(activeLang, "project_name", e.target.value)
              }
            />

            <label>Kategori (Dil Bazlı)</label>
            <input
              type="text"
              className={styles.input}
              value={current.category || ""}
              onChange={(e) =>
                handleLangChange(activeLang, "category", e.target.value)
              }
            />
            <label>Açıklama</label>
            <SimpleEditor
              key={`${activeLang}-desc`}
              value={current.description}
              onChange={(val) =>
                handleLangChange(activeLang, "description", val)
              }
            />

            <h4>Sekmeler</h4>
            {current.tabs?.map((tab, index) => (
              <div
                key={index}
                className={styles.section}
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  onClick={() => removeTab(index)}
                  className={styles.deleteButton}
                  style={{ position: "absolute", right: 0, top: 0 }}
                >
                  ❌
                </button>
                <label>Başlık {index + 1}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={tab.title}
                  onChange={(e) =>
                    handleTabChange(activeLang, index, "title", e.target.value)
                  }
                />
                <label>İçerik {index + 1}</label>
                <SimpleEditor
                  key={`${activeLang}-${index}`}
                  value={tab.content}
                  onChange={(e) =>
                    handleTabChange(activeLang, index, "content", e)
                  }
                />
                <label>HTML Kod</label>
                <textarea
                  className={styles.input}
                  rows={5}
                  value={form.html || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      html: e.target.value,
                    }))
                  }
                  placeholder=""
                />

                <label>Önizleme</label>
                <div
                  className={styles.previewBox}
                  dangerouslySetInnerHTML={{
                    __html: form.html || "",
                  }}
                  style={{
                    padding: "1rem",
                    border: "1px solid #ccc",
                    background: "#fff",
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={addTab} className={styles.input}>
              + Yeni Sekme Ekle
            </button>
          </section>

          <button
            type="submit"
            className="submitButton"
            disabled={!isFormValid()}
          >
            EKLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
