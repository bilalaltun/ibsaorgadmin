// ThemeForm.js
"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import UploadField from "@/components/UploadField/UploadField";

export default function ThemeForm({ data }) {
  const [form, setForm] = useState({
    logo_img: data?.logo_img || "",
    facebook: data?.facebook || "",
    youtube: data?.youtube || "",
    linkedin: data?.linkedin || "",
    instagram: data?.instagram || "",
    twitter: data?.twitter || "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={(e) => e.preventDefault} className={styles["form-card"]}>
      <label>Logo</label>
      <UploadField
        type="image"
        value={form.logo_img}
        onChange={(url) => handleChange("logo_img", url)}
        label="Görsel Yükle"
        accept="image/*"
        multiple={false}
      />

      <label>Facebook</label>
      <input
        value={form.facebook}
        onChange={(e) => handleChange("facebook", e.target.value)}
      />
      <label>Youtube</label>
      <input
        value={form.youtube}
        onChange={(e) => handleChange("youtube", e.target.value)}
      />
      <label>Linkedin</label>
      <input
        value={form.linkedin}
        onChange={(e) => handleChange("linkedin", e.target.value)}
      />
      <label>Instagram</label>
      <input
        value={form.instagram}
        onChange={(e) => handleChange("instagram", e.target.value)}
      />
      <label>Twitter</label>
      <input
        value={form.twitter}
        onChange={(e) => handleChange("twitter", e.target.value)}
      />
    </form>
  );
}
