"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css"; // Ortak stil kullanımı
import Cookies from "js-cookie";

export default function CreateUserPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    isactive: true,
    date: new Date().toISOString().slice(0, 10),
  });

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
      title: "Kullanıcı ekleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Kullanıcı eklenemedi.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Kullanıcı başarıyla eklendi.",
      });

      window.location.href = "/users";
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Ekleme sırasında bir hata oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Yeni Kullanıcı Ekle</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              className={styles.input}
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="Kullanıcı Adı"
            />

            <label>Şifre</label>
            <input
              type="text"
              className={styles.input}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Şifre"
            />
          </section>

          <button
            type="submit"
            className={"submitButton"}
            disabled={!isFormValid()}
          >
            EKLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
