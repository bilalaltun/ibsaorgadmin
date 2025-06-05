// EditTitle.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";

const langs = ["tr", "en", "ar"];

export default function EditTitle() {
  const { id } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState();
  const [multiLangData, setMultiLangData] = useState(() =>
    langs.reduce((acc, lang) => {
      acc[lang] = "";
      return acc;
    }, {})
  );

  const [activeLang, setActiveLang] = useState("tr");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/sitetags?id=${id}`);
        const json = await res.json();
        const incoming = {};
        langs.forEach((lang) => {
          incoming[lang] = json.title?.[lang] || "";
        });
        setStatus(json.isactive);
        setMultiLangData(incoming);
      } catch {
        Swal.fire("Hata", "Veri alınamadı.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (lang, value) => {
    setMultiLangData((prev) => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (langs.some((lang) => !multiLangData[lang].trim())) {
      Swal.fire("Uyarı", "Tüm dillerde başlık girilmelidir.", "warning");
      return;
    }

    Swal.fire({ title: "Güncelleniyor...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/sitetags?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: multiLangData,
          isactive: status,
          date: "",
        }),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Başlık güncellendi.", "success").then(() => {
        router.push("/etikets");
      });
    } catch {
      Swal.fire("Hata", "Güncelleme başarısız.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>📄 Başlık Güncelle</h1>
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
            GÜNCELLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
