"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css"; // Shared styles
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
        title: "Missing Information",
        text: "Username and password are required.",
      });
      return;
    }

    Swal.fire({
      title: "Creating user...",
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

      if (!res.ok) throw new Error("Failed to create user.");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User has been created successfully.",
      });

      window.location.href = "/users";
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while creating the user.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Add New User</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Username</label>
            <input
              type="text"
              className={styles.input}
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="Enter username"
            />

            <label>Password</label>
            <input
              type="text"
              className={styles.input}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter password"
            />
          </section>

          <button
            type="submit"
            className={"submitButton"}
            disabled={!isFormValid()}
          >
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
