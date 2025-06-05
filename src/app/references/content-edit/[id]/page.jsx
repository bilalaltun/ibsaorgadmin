"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditReferansPage() {
  const { id } = useParams();
  const router = useRouter();
  const imageRef = useRef();

  const [languages, setLanguages] = useState([]); // örn: ['tr', 'en', 'ar']
  const [form, setForm] = useState({
    img: "",
    name: {},
    isactive: true,
    show_at_home: true,
  });
  const [activeLang, setActiveLang] = useState("tr");
  const [loading, setLoading] = useState(true);

  // Dil listesini çek
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/languages");
        const data = await res.json();
        const langs = data.map((l) => l.name); // ['tr', 'en', 'ar']
        setLanguages(langs);
        setActiveLang(langs[0] || "tr");
      } catch {
        Swal.fire("Hata", "Diller alınamadı", "error");
      }
    }

    fetchLanguages();
  }, []);

  // Referans verisini çek
  useEffect(() => {
    async function fetchReferans() {
      try {
        const res = await fetch(`/api/references?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı.");
        const json = await res.json()
        const data = json.data;

        // Dil eksiklerini tamamla
        const filledName = {};
        languages.forEach((lang) => {
          filledName[lang] = data.name?.[lang] || "";
        });

        setForm({
          img: data.img || "",
          name: filledName,
          isactive: data.isactive ?? true,
          show_at_home: data.show_at_home ?? true,
        });
      } catch (err) {
        Swal.fire("Hata", "Veri alınamadı.", "error");
      } finally {
        setLoading(false);
      }
    }

    if (languages.length > 0) {
      fetchReferans();
    }
  }, [id, languages]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        [lang]: value,
      },
    }));
  };

  const isFormValid = () =>
    form.img && languages.every((lang) => form.name[lang]?.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm dillerdeki isim alanları doldurulmalı.", "warning");
      return;
    }

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const payload = {
      img: form.img,
      isactive: form.isactive,
      show_at_home: true,
      name: Object.entries(form.name).map(([langCode, value]) => ({
        langCode,
        value,
      })),
    };

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/references?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Referans güncellendi.", "success").then(() => {
        router.push("/references");
      });
    } catch {
      Swal.fire("Hata", "Güncelleme başarısız.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Referans Düzenle #{id}</h2>

        {loading ? (
          <div className="loadingSpinner">Yükleniyor...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>Görsel</label>
            <UploadField
              ref={imageRef}
              type="image"
              accept="image/*"
              value={form.img}
              onChange={(url) => handleChange("img", url)}
              label="Görsel Seç"
            />

            <label>İsimler</label>
            <div className={styles.langTabs}>
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`${styles.tabButton} ${
                    activeLang === lang ? styles.active : ""
                  }`}
                  onClick={() => setActiveLang(lang)}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <input
              type="text"
              className={styles.input}
              placeholder={`${activeLang.toUpperCase()} İsim`}
              value={form.name[activeLang] || ""}
              onChange={(e) => handleLangChange(activeLang, e.target.value)}
            />

            <button
              type="submit"
              className={styles.submitButton}
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
