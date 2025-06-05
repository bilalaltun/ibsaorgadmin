"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import UploadField from "@/components/UploadField/UploadField";
import styles from "./styles.module.css";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";

export default function EditCertificate() {
  const { id } = useParams();
  const router = useRouter();
  const imageRef = useRef();

  const [langs, setLangs] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");
  const [form, setForm] = useState({
    title: {},
    img: "",
    isactive: true,
    date: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      const res = await fetch("/api/languages");
      const data = await res.json();
      setLangs(data);
      if (data.length > 0) setActiveLang(data[0].name);
    };

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/certificates?id=${id}`);
        const json = await res.json();
        const item = json.data;

        const titleMap = {};
        Object.keys(item.title).forEach((key) => {
          titleMap[key] = item.title[key];
        });

        setForm({
          title: titleMap,
          img: item.img || "",
          isactive: item.isactive ?? true,
          date: item.date?.split("T")[0] || "",
        });
      } catch {
        Swal.fire("Hata", "Veri alınamadı.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
    fetchData();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLangChange = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: value,
      },
    }));
  };

  const isFormValid = () => {
    return (
      form.img.trim() &&
      langs.every((lang) => form.title[lang.name]?.trim())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanları doldurun.", "warning");
      return;
    }

    Swal.fire({ title: "Güncelleniyor...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");

      const payload = {
        img: form.img,
        date: form.date,
        isactive: form.isactive,
        title: langs.map((lang) => ({
          langCode: lang.name,
          value: form.title[lang.name] || "",
        })),
      };

      const res = await fetch(`/api/certificates?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Sertifika güncellendi.", "success").then(() => {
        router.push("/certificates");
      });
    } catch {
      Swal.fire("Hata", "Güncelleme başarısız.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>📄 Sertifika Güncelle</h1>
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <section className={styles.section}>
            <h2>Sertifika Bilgileri</h2>

            <label>Görsel</label>
            <UploadField
              ref={imageRef}
              type="image"
              label="Görsel Yükle"
              value={form.img}
              onChange={(url) => handleChange("img", url)}
              accept="image/*"
              multiple={false}
            />

            <div className={styles.tabsContainer}>
              <div className={styles.langTabs}>
                {langs.map((lang) => (
                  <button
                    key={lang.name}
                    type="button"
                    className={
                      activeLang === lang.name
                        ? styles.active
                        : styles.tab
                    }
                    onClick={() => setActiveLang(lang.name)}
                  >
                    {lang.name.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className={styles.tabContent}>
                <label>Başlık ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  value={form.title?.[activeLang] || ""}
                  onChange={(e) =>
                    handleLangChange(activeLang, e.target.value)
                  }
                  className={styles.input}
                />
              </div>
            </div>
          </section>
          <button type="submit" className={styles.submitButton}>
            GÜNCELLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
