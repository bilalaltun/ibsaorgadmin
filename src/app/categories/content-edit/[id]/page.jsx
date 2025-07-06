"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditCatalogPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    order: 100000,
    isactive: true,
  });

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch(`/api/categories?id=${id}`);
        if (!res.ok) throw new Error("Məlumat alına bilmədi.");
        const data = await res.json();
        setForm({
          order: data.order,
          name: data.name,
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error("Kateqoriya məlumatı alına bilmədi:", err);
        setError("Kateqoriya tapılmadı.");
      }
    }

    fetchCatalog();
  }, [id]);

  const handleLangTitleChange = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        [lang]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Yenilənir...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    const payload = {
      order: form.order,
      isactive: form.isactive,
      title: form.name,
    };
    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Yenilənmə uğursuz oldu.");
      Swal.fire({
        icon: "success",
        title: "Uğurlu!",
        text: "Kateqoriya yeniləndi.",
      }).then(() => router.push("/categories"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Yeniləmə zamanı xəta baş verdi.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Kateqoriyanı Redaktə Et</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <label>Başlıq </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) =>
                setForm((data) => ({ ...data, name: e.target.value }))
              }
            />
          </div>

          <button type="submit" className={"submitButton"}>
            YENİLƏ
          </button>
        </form>
      </div>
    </Layout>
  );
}
