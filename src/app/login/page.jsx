"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Logging in...",
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
          expires: 1,
          path: "/",
        });
        Cookies.set("user", JSON.stringify(data.user), {
          expires: 1,
        });
        Cookies.set("username", username, {
          expires: 1,
        });

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Redirecting...",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          router.push("/dashboard");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Incorrect username or password.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "An error occurred during login.",
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
          <img
            src="/images/logo-dark.svg"
            alt="Logo"
            className={styles.logoImg}
          />
        </div>

        <h2 className={styles.title}>Admin Panel Login</h2>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
