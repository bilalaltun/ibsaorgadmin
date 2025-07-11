"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css"; // Using the same styles

export default function EditSliderPage() {
  const { id } = useParams();

  const [form, setForm] = useState({
    image_url: "",
    video_url: "",
    dynamic_link_title: "default",
    dynamic_link: "",
    dynamic_link_alternative: "",
    order: 1,
    isactive: true,
    titles: "",
    description: "",
    content: "", // date or text
  });

  useEffect(() => {
    async function fetchSlider() {
      try {
        const res = await fetch(`/api/sliders?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch slider data.");
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Slider could not be loaded.", "error");
      }
    }

    if (id) fetchSlider();
  }, [id]);

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

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/sliders?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed");

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Slider updated successfully.",
      }).then(() => {
        window.location.href = "/slider";
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred during update.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Slider</h2>

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
            onChange={(e) => handleChange("title", e.target.value)}
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
            UPDATE SLIDER
          </button>
        </form>
      </div>
    </Layout>
  );
}
