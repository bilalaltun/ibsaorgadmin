"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./login.module.css";
import NextImage from "next/image";


export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Giriş yapılıyor...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("token", data.token, {
          expires: 1, // gün olarak
          path: "/",
        });

        Cookies.set("username", username, {
          expires: 1, // gün olarak
        });

        Swal.fire({
          icon: "success",
          title: "Giriş Başarılı",
          text: "Yönlendiriliyorsunuz...",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          router.push("/dashboard");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Hatalı Giriş",
          text: data.message || "Kullanıcı adı veya şifre hatalı.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Sunucu Hatası",
        text: "Giriş sırasında bir hata oluştu.",
      });
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/slider");
    }
  }, []);

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.leftPane}>
        <img
          src="/images/logincover.png"
          alt="Mızrak Makine"
          className={styles.loginImage}
        />


      </div>

      <div className={styles.rightPane}>
        <div className={styles.logo}>
          <img src="/images/logo.png" alt="Logo" className={styles.logoImg} />
        </div>

        <h2 className={styles.title}>Admin Panel Login</h2>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.loginButton}>
            Giriş
          </button>
        </form>
      </div>
    </div>
  );
}
