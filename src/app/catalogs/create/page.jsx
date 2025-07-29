"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateCatalogPage() {
  const router = useRouter();
  const imageRef = useRef();
  const fileRefs = useRef({}); // ✅ Correct placement of useRef

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});
  const [fileData, setFileData] = useState({});

  const [form, setForm] = useState({
    cover_img: "",
    isactive: true,
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

        // Çok dilli verileri başlat
        const titles = langs.reduce((acc, lang) => {
          acc[lang] = "";
          return acc;
        }, {});
        setMultiLangData(titles);

        const files = langs.reduce((acc, lang) => {
          acc[lang] = "";
          return acc;
        }, {});
        setFileData(files);
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
    setMultiLangData((prev) => ({ ...prev, [lang]: value }));
  };

  const handleFileChange = (lang, url) => {
    setFileData((prev) => ({ ...prev, [lang]: url }));
  };

  const isFormValid = () =>
    form.cover_img &&
    languages.every((lang) => multiLangData[lang]?.trim() && fileData[lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm dil alanları ve dosyalar zorunludur.", "warning");
      return;
    }

    const title = languages.map((lang) => ({
      value: multiLangData[lang],
      langCode: lang,
    }));

    const files = languages.map((lang) => ({
      value: fileData[lang],
      langCode: lang,
    }));

    const payload = {
      cover_img: form.cover_img,
      isactive: true,
      title,
      files,
    };

    Swal.fire({
      title: "Katalog ekleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/catalogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Katalog başarıyla eklendi.", "success");

      setForm({ cover_img: "", isactive: true });
      setMultiLangData(
        languages.reduce((acc, lang) => {
          acc[lang] = "";
          return acc;
        }, {})
      );
      setFileData(
        languages.reduce((acc, lang) => {
          acc[lang] = "";
          return acc;
        }, {})
      );

      imageRef.current?.reset?.();
      Object.values(fileRefs.current).forEach((ref) => ref?.reset?.());

      router.push("/catalogs");
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Kaydetme sırasında bir hata oluştu.", "error");
    }
  };

  const currentTitle = multiLangData[activeLang] || "";
  const currentFile = fileData[activeLang] || "";

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Katalog Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Kapak Görseli</label>
            <UploadField
              ref={imageRef}
              type="image"
              accept="image/*"
              value={form.cover_img}
              label="Kapak Görseli Yükle"
              onChange={(url) => handleChange("cover_img", url)}
            />

            {languages.length > 0 && (
              <>
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

                <label>Başlık ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  className={styles.input}
                  value={currentTitle}
                  onChange={(e) =>
                    handleLangChange(activeLang, e.target.value)
                  }
                />

                <label>PDF Dosyası ({activeLang.toUpperCase()})</label>
                <UploadField
                key={activeLang}
                  ref={(el) => (fileRefs.current[activeLang] = el)}
                  type="file"
                  accept="*"
                  value={currentFile}
                  label={`${activeLang.toUpperCase()} PDF Yükle`}
                  onChange={(url) => handleFileChange(activeLang, url)}
                />
              </>
            )}
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
