// GeneralForm.js
"use client";

import { useState } from "react";
import styles from "./styles.module.css";

export default function GeneralForm({ data }) {
  const [form, setForm] = useState({
    site_address: data?.site_address || "",
    site_code: data?.site_code || "",
    google_analytics: data?.google_analytics || "",
    whatsapp_number: data?.whatsapp_number || "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className={styles["form-card"]}>
      <label>Site Adresi</label>
      <input
        value={form.site_address}
        onChange={(e) => handleChange("site_address", e.target.value)}
      />

      <label>Site Kodu</label>
      <input
        value={form.site_code}
        onChange={(e) => handleChange("site_code", e.target.value)}
      />

      <label>Google Analytics Kodu</label>
      <input
        value={form.google_analytics}
        onChange={(e) => handleChange("google_analytics", e.target.value)}
      />

      <label>Whatsapp Numarası</label>
      <input
        value={form.whatsapp_number}
        onChange={(e) => handleChange("whatsapp_number", e.target.value)}
      />
    </form>
  );
}
