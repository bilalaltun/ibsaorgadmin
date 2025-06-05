"use client";

import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function CreateCatalogPage() {
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: "",
    url: "",
  });

  const isFormValid = () => {
    return form.name.trim() !== "" && form.url.trim() !== "";
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Lütfen başlık ve dosya yükleyin.",
      });
      return;
    }

    Swal.fire({
      title: "Dil ekleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/languages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Dil eklenemedi.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Dil başarıyla eklendi.",
      }).then(() => {
        window.location.href = "/languages";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Kaydetme sırasında bir hata oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Dil Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Görsel</label>
            <UploadField
              ref={fileRef}
              type="image"
              accept="image/*"
              value={form.url}
              label="Görsel Yükle"
              onChange={(url) => handleChange("url", url)}
            />
            <label>Başlık</label>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
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
