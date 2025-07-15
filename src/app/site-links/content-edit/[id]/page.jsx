"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";

export default function EditLinkPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    link: "",
    startDate: "",
    endDate: "",
    isactive: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const res = await fetch(`/api/links?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch link.");
        const data = await res.json();

        setForm({
          name: data.name || "",
          link: data.link || "",
          startDate: data.startDate ? data.startDate.split('T')[0] : "",
          endDate: data.endDate ? data.endDate.split('T')[0] : "",
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error("Error loading link:", err);
        setError("Link not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [id]);

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
      const res = await fetch(`/api/links?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Link updated successfully", "success");
      window.location.pathname = "/site-links";
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update link", "error");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.error}>{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Site Link</h2>
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
            UPDATE LINK
          </button>
        </form>
      </div>
    </Layout>
  );
} 