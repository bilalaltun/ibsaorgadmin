"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateMenuPage() {
  const [form, setForm] = useState({
    url: "",
    title: "",
    isactive: true,
    submenus: [],
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSubmenu = () => {
    setForm((prev) => ({
      ...prev,
      submenus: [...prev.submenus, { url: "", title: "", isactive: true }],
    }));
  };

  const removeSubmenu = (index) => {
    setForm((prev) => ({
      ...prev,
      submenus: prev.submenus.filter((_, i) => i !== index),
    }));
  };

  const handleSubmenuChange = (index, field, value) => {
    const updated = [...form.submenus];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, submenus: updated }));
  };

  const isFormValid = () => {
    return (
      form.url.trim() !== "" &&
      form.title.trim() !== "" &&
      form.submenus.every((s) => s.url.trim() !== "" && s.title.trim() !== "")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "All fields are required", "warning");
      return;
    }

    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");

      const payload = {
        url: form.url,
        title: form.title,
        isactive: form.isactive,
        submenus: form.submenus,
      };

      const res = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Menu saved successfully", "success");
      window.location.pathname = "/menus";
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save menu", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create Menu</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Main Menu URL</label>
          <input
            type="text"
            className={styles.input}
            value={form.url}
            onChange={(e) => handleChange("url", e.target.value)}
          />

          <label>Main Menu Title</label>
          <input
            type="text"
            className={styles.input}
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
          >
            SAVE MENU
          </button>
        </form>
      </div>
    </Layout>
  );
}
