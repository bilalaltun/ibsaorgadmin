"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateCatalogPage() {
  const router = useRouter();
  const imageRef = useRef();

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});
  const [order, setOrder] = useState(0);

  const [form, setForm] = useState({
    isactive: true,
  });

  useEffect(() => {
    async function fetchLanguagesAndOrder() {
      try {
        const langRes = await fetch("/api/languages");
        if (!langRes.ok) throw new Error("Dillər alına bilmədi.");
        const langData = await langRes.json();
        const langs = langData.map((l) => l.name);
        setLanguages(langs);
        setActiveLang(langs[0]);

        const catalogsRes = await fetch("/api/categories");
        if (!catalogsRes.ok) throw new Error("Kateqoriya məlumatları alına bilmədi.");
        const catalogsData = await catalogsRes.json();

        const maxOrder = catalogsData.data.reduce((max, catalog) => {
          return Math.max(max, catalog.order);
        }, 0);

        setOrder(maxOrder + 1);
      } catch (err) {
        console.error("Məlumat alına bilmədi:", err);
      }
    }

    fetchLanguagesAndOrder();
  }, []);

  const handleLangChange = (lang, value) => {
    setMultiLangData((prev) => ({ ...prev, [lang]: value }));
  };

  const isFormValid = () =>
    languages.every((lang) => multiLangData[lang]?.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Xəbərdarlıq", "Bütün dil sahələri məcburidir.", "warning");
      return;
    }

    const title = languages.map((lang) => ({
      value: multiLangData[lang],
      langCode: lang,
    }));

    const payload = {
      order,
      isactive: form.isactive,
      title,
    };

    Swal.fire({
      title: "Kateqoriya əlavə olunur...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Uğurlu", "Kateqoriya uğurla əlavə olundu.", "success");

      setForm({ isactive: true });
      setMultiLangData(
        languages.reduce((acc, lang) => {
          acc[lang] = "";
          return acc;
        }, {})
      );

      imageRef.current?.reset?.();

      router.push("/categories");
    } catch (err) {
      console.error(err);
      Swal.fire("Xəta", "Yadda saxlanılma zamanı xəta baş verdi.", "error");
    }
  };

  const currentTitle = multiLangData[activeLang] || "";

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Kateqoriya Əlavə Et</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
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

              <label>Başlıq ({activeLang.toUpperCase()})</label>
              <input
                type="text"
                className={styles.input}
                value={currentTitle}
                onChange={(e) => handleLangChange(activeLang, e.target.value)}
              />
            </>
          )}

          <button
            type="submit"
            className={"submitButton"}
            disabled={!isFormValid()}
          >
            ƏLAVƏ ET
          </button>
        </form>
      </div>
    </Layout>
  );
}
