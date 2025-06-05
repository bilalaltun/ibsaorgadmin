// ContactForm.js
"use client";

import { useState } from "react";
import styles from "./styles.module.css";

export default function ContactForm({ data }) {
  const [form, setForm] = useState({
    phone: data?.phone || "",
    email: data?.email || "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className={styles["form-card"]}>
      <label>Telefon</label>
      <input
        value={form.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
      />

      <label>E-posta</label>
      <input
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />
    </form>
  );
}
