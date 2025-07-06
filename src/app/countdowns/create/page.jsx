"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateCountdownPage() {
  const router = useRouter();
  const imageRef = useRef();

  const [form, setForm] = useState({
    name: "",
    icon_url: "",
    link: "",
    date: "",
    isactive: true,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return form.name.trim() && form.icon_url && form.date;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Missing Info", "Please fill in all required fields.", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch("/api/countdowns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Countdown created successfully.", "success").then(() =>
        router.push("/countdowns")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while saving.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create Countdown</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Event Name</label>
          <input
            className={styles.input}
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <label>Icon Image</label>
          <UploadField
            ref={imageRef}
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
            placeholder="https://example.com"
          />

          <label>Event Date</label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          <button type="submit" className="submitButton">
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
