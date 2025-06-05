"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function CreateContactPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    gmail: "",
    isactive: true,
    phones: [{ phone_number: "" }],
  });

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});

  // Dilleri API'den çek
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/languages");
        if (!res.ok) throw new Error("Diller alınamadı.");
        const data = await res.json();

        const langs = data.map((l) => l.name);
        setLanguages(langs);
        setActiveLang(langs[0]);

        const initialData = langs.reduce((acc, lang) => {
          acc[lang] = { title: "", address: "" };
          return acc;
        }, {});
        setMultiLangData(initialData);
      } catch (err) {
        console.error("Dil verisi alınamadı:", err);
      }
    }

    fetchLanguages();
  }, []);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (index, value) => {
    const updated = [...form.phones];
    updated[index].phone_number = value;
    setForm((prev) => ({ ...prev, phones: updated }));
  };

  const addPhone = () => {
    setForm((prev) => ({
      ...prev,
      phones: [...prev.phones, { phone_number: "" }],
    }));
  };

  const removePhone = (index) => {
    setForm((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  const handleLangChange = (lang, key, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }));
  };

  const isFormValid = () => {
    return (
      form.gmail.trim() &&
      form.phones.every((p) => p.phone_number.trim()) &&
      languages.every(
        (lang) =>
          multiLangData[lang].title.trim() && multiLangData[lang].address.trim()
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanlar eksiksiz doldurulmalıdır.", "warning");
      return;
    }

    const title = languages.map((lang) => ({
      value: multiLangData[lang].title,
      langCode: lang,
    }));

    const address = languages.map((lang) => ({
      value: multiLangData[lang].address,
      langCode: lang,
    }));

    const payload = {
      gmail: form.gmail,
      isactive: form.isactive,
      phones: form.phones,
      title,
      address,
    };

    Swal.fire({ title: "Kaydediliyor...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "İletişim noktası eklendi.", "success").then(() =>
        router.push("/contact-details")
      );
    } catch {
      Swal.fire("Hata", "Veri kaydedilemedi.", "error");
    }
  };

  const current = multiLangData[activeLang] || {};

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Lokasyon Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Email</label>
            <input
              type="email"
              className={styles.input}
              value={form.gmail}
              onChange={(e) => handleFormChange("gmail", e.target.value)}
            />

            <label>Telefonlar</label>
            {form.phones.map((p, i) => (
              <div key={i} className={styles.phoneRow}>
                <input
                  type="text"
                  value={p.phone_number}
                  className={styles.input}
                  style={{ marginBottom: "10px" }}
                  onChange={(e) => handlePhoneChange(i, e.target.value)}
                  placeholder={`Telefon ${i + 1}`}
                />
                {form.phones.length > 1 && (
                  <button type="button" onClick={() => removePhone(i)}>
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPhone}
              className={styles.addPhoneBtn}
            >
              + Yeni Telefon
            </button>
          </section>

          {languages.length > 0 && (
            <section className={styles.section}>
              <div className={styles.langTabs}>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={activeLang === lang ? styles.active : ""}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <label>Başlık ({activeLang.toUpperCase()})</label>
              <input
                value={current.title}
                className={styles.input}
                onChange={(e) =>
                  handleLangChange(activeLang, "title", e.target.value)
                }
              />

              <label>Adres ({activeLang.toUpperCase()})</label>
              <textarea
                rows={2}
                value={current.address}
                className={styles.input}
                onChange={(e) =>
                  handleLangChange(activeLang, "address", e.target.value)
                }
              />
            </section>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
          >
            EKLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
