"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function EditCountdownPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    icon_url: "",
    link: "",
    date: "",
    isactive: true,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCountdown() {
      try {
        const res = await fetch(`/api/countdowns?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch countdown.");
        const data = await res.json();

        setForm({
          name: data.name || "",
          icon_url: data.icon_url || "",
          link: data.link || "",
          date: data.date || "",
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error("Failed to load countdown:", err);
        setError("Countdown not found.");
      }
    }

    fetchCountdown();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const payload = {
      name: form.name,
      icon_url: form.icon_url,
      link: form.link,
      date: form.date,
      isactive: form.isactive,
    };

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/countdowns?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Countdown updated successfully.",
      }).then(() => router.push("/countdowns"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the countdown.",
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <p className="error">{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Countdown</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Event Name</label>
          <input
            className={styles.input}
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />

          <label>Icon Image</label>
          <UploadField
            type="image"
            accept="image/*"
            value={form.icon_url}
            label="Upload Icon"
            onChange={(url) => handleChange("icon_url", url)}
          />

          <label>Link (optional)</label>
          <input
            className={styles.input}
            type="url"
            value={form.link}
            onChange={(e) => handleChange("link", e.target.value)}
          />

          <label>Event Date</label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />

          <button type="submit" className="submitButton">
            UPDATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
