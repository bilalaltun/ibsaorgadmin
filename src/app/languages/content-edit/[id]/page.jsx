"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditCatalogPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: "",
    url: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch(`/api/languages?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı.");
        const data = await res.json();
        setForm({
          name: data.name || "",
          url: data.url || "",
        });
      } catch (err) {
        console.error("Katalog verisi alınamadı:", err);
        setError("Katalog bulunamadı.");
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [id]);

  const isFormValid = () => form.name.trim() !== "" && form.url.trim() !== "";

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Başlık ve dosya zorunludur.",
      });
      return;
    }

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/languages?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Dil güncellendi.",
      }).then(() => router.push("/languages"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Güncelleme sırasında bir hata oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Dil Düzenle #{id}</h2>

        {loading ? (
          <div className="loadingSpinner">Yükleniyor...</div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.section}>
              <label>Başlık</label>
              <input
                type="text"
                className={styles.input}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <label>Görsel</label>
              <UploadField
                ref={fileRef}
                type="image"
                accept="image/*"
                value={form.url}
                label="Görsel Seç"
                onChange={(url) => handleChange("url", url)}
              />
            </section>

            <button
              type="submit"
              className={"submitButton"}
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
