"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    isactive: true,
    date: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users?id=${id}`);
        if (!res.ok) throw new Error("Kullanıcı verisi alınamadı.");
        const data = await res.json();
        setForm({
          username: data.username,
          password: "",
          isactive: true,
          date: data.date,
        });
      } catch (err) {
        console.error(err);
        setError("Kullanıcı bulunamadı.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return form.username.trim() && form.password.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgi",
        text: "Kullanıcı adı ve şifre zorunludur.",
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
      const res = await fetch(`/api/users?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Kullanıcı güncellendi.",
      }).then(() => router.push("/users"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Güncelleme sırasında bir sorun oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Kullanıcı Düzenle – #{id}</h2>

        {loading ? (
          <div className={"loadingSpinner"}>
            <div className={"spinner"} />
            <p>İçerikler yükleniyor...</p>
          </div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.section}>
              <label>Kullanıcı Adı</label>
              <input
                type="text"
                className={styles.input}
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />

              <label>Şifre</label>
              <input
                type="text"
                className={styles.input}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
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
