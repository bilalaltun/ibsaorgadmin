"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";

export default function CreateLinkPage() {
  const [form, setForm] = useState({
    name: "",
    link: "",
    startDate: "",
    endDate: "",
    isactive: true,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      form.name.trim() !== "" &&
      form.link.trim() !== "" &&
      form.startDate !== "" &&
      form.endDate !== ""
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
      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Link saved successfully", "success");
      window.location.pathname = "/site-links";
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save link", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create Site Link</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Name</label>
          <input
            type="text"
            className={styles.input}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter link name"
          />

          <label>Link URL</label>
          <input
            type="url"
            className={styles.input}
            value={form.link}
            onChange={(e) => handleChange("link", e.target.value)}
            placeholder="https://example.com"
          />

          <label>Start Date</label>
          <input
            type="date"
            className={styles.input}
            value={form.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />

          <label>End Date</label>
          <input
            type="date"
            className={styles.input}
            value={form.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.isactive}
              onChange={(e) => handleChange("isactive", e.target.checked)}
            />
            Active
          </label>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
          >
            SAVE LINK
          </button>
        </form>
      </div>
    </Layout>
  );
} 