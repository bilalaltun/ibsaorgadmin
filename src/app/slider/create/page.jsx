"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./CreateSliderPage.module.css";

export default function CreateSliderPage() {
  const [form, setForm] = useState({
    image_url: "",
    titles: "",
    content: "", // this is used for the date (string)
    dynamic_link: "",
    order: 1,
    isactive: true,
  });

  useEffect(() => {
    async function fetchSliderCount() {
      try {
        const res = await fetch("/api/sliders");
        if (!res.ok) throw new Error("Failed to fetch slider list.");
        const data = await res.json();
        const count = data?.data?.length || 0;
        setForm((prev) => ({ ...prev, order: count + 1 }));
      } catch (err) {
        console.error("Failed to calculate order:", err);
      }
    }

    fetchSliderCount();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () =>
    form.image_url &&
    form.titles.trim() &&
    form.content.trim() &&
    form.dynamic_link.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Image, title, date, and link are required.",
      });
      return;
    }

    const payload = {
      image_url: form.image_url,
      video_url: "",
      dynamic_link_title: "default",
      dynamic_link: form.dynamic_link,
      dynamic_link_alternative: "",
      order: form.order,
      isactive: form.isactive,
      titles: form.titles,
      description: "",
      content: form.content,
    };

    Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/sliders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit slider.");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Slider created successfully.",
      }).then(() => {
        window.location.href = "/slider";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during submission.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create New Slider</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Image</label>
          <UploadField
            type="image"
            accept="image/*"
            value={form.image_url}
            onChange={(url) => handleChange("image_url", url)}
            label="Upload Image"
          />

          <label>Title</label>
          <input
            type="text"
            className={styles.input}
            value={form.titles}
            onChange={(e) => handleChange("titles", e.target.value)}
          />

          <label>Date</label>
          <input
            type="date"
            className={styles.input}
            value={form.content}
            onChange={(e) => handleChange("content", e.target.value)}
          />

          <label>Link</label>
          <input
            type="text"
            className={styles.input}
            value={form.dynamic_link}
            onChange={(e) => handleChange("dynamic_link", e.target.value)}
          />

          <button type="submit" className={styles.submitButton}>
            CREATE SLIDER
          </button>
        </form>
      </div>
    </Layout>
  );
}
