"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditMenuPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    url: "",
    title: "",
    isactive: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menus?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch menu.");
        const data = await res.json();

        setForm({
          url: data.url || "",
          title: data.title || "",
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error("Error loading menu:", err);
        setError("Menu not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return form.url.trim() !== "" && form.title.trim() !== "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "URL and Title are required.", "warning");
      return;
    }

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");

      const payload = {
        url: form.url,
        title: form.title,
        isactive: form.isactive,
      };

      const res = await fetch(`/api/menus?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Menu updated successfully.", "success").then(() =>
        router.push("/menus")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update menu.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Menu</h2>
        {loading ? (
          <div className="loadingSpinner">Loading...</div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
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
              UPDATE MENU
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
