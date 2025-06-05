"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function ContactEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState("");
  const [multiLangData, setMultiLangData] = useState({});
  const [form, setForm] = useState({
    gmail: "",
    isactive: true,
    phones: [],
  });

  // Veri çekme
  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch(`/api/contacts?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı");
        const json = await res.json();
        const data = json.data;

        // Ana alanlar
        setForm({
          gmail: data.gmail || "",
          isactive: data.isactive ?? true,
          phones: data.phones?.length ? data.phones : [{ phone_number: "" }],
        });

        // Çok dilli alanlar
        const titles = data.title || {};
        const addresses = data.address || {};
        const langs = Object.keys(titles); // aktif diller burada
        setLanguages(langs);
        setActiveLang(langs[0]);

        const langState = langs.reduce((acc, lang) => {
          acc[lang] = {
            title: titles[lang] || "",
            address: addresses[lang] || "",
          };
          return acc;
        }, {});
        setMultiLangData(langState);
      } catch (err) {
        console.error("❌ Veri alınamadı:", err);
        setError("Veri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    fetchContact();
  }, [id]);

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
          multiLangData[lang].title.trim() &&
          multiLangData[lang].address.trim()
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanlar eksiksiz doldurulmalıdır.", "warning");
      return;
    }

    const convertToLangArray = (key) =>
      languages.map((lang) => ({
        langCode: lang,
        value: multiLangData[lang][key],
      }));

    const payload = {
      gmail: form.gmail,
      isactive: form.isactive,
      phones: form.phones,
      title: convertToLangArray("title"),
      address: convertToLangArray("address"),
    };

    Swal.fire({ title: "Güncelleniyor...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/contacts?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "İletişim bilgisi güncellendi.", "success").then(() =>
        router.push("/contact-details")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Güncelleme başarısız oldu.", "error");
    }
  };

  const current = multiLangData[activeLang] || {};

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>İletişim Bilgisi Düzenle #{id}</h2>

        {loading ? (
          <div className={"loadingSpinner"}>
            <div className={"spinner"} />
            <p>Yükleniyor...</p>
          </div>
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Genel Alanlar */}
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

            {/* Çok Dilli Alanlar */}
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
                  className={styles.input}
                  value={current.title}
                  onChange={(e) =>
                    handleLangChange(activeLang, "title", e.target.value)
                  }
                />

                <label>Adres ({activeLang.toUpperCase()})</label>
                <textarea
                  rows={2}
                  className={styles.input}
                  value={current.address}
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
              GÜNCELLE
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
