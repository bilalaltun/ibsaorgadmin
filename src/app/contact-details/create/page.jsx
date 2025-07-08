"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function CreateContactPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    gmail: "",
    isactive: true,
    title: "",
    address: "",
    phones: [{ phone_number: "" }],
  });

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (index, value) => {
    const updated = [...form.phones];
    updated[index].phone_number = value;
    setForm((prev) => ({ ...prev, phones: updated }));
  };

  const addPhone = () => {
    setForm((prev) => ({
      ...prev,
      phones: [...prev.phones, { phone_number: "" }],
    }));
  };

  const removePhone = (index) => {
    setForm((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = () => {
    return (
      form.gmail.trim() !== "" &&
      form.title.trim() !== "" &&
      form.address.trim() !== "" &&
      form.phones.every((p) => p.phone_number.trim() !== "")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "All fields must be filled in.", "warning");
      return;
    }

    const payload = {
      gmail: form.gmail,
      isactive: form.isactive,
      title: form.title,
      address: form.address,
      phones: form.phones,
    };

    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Contact location added successfully.", "success").then(() =>
        router.push("/contact-details")
      );
    } catch {
      Swal.fire("Error", "Failed to save data.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Add New Location</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Email</label>
            <input
              type="email"
              className={styles.input}
              value={form.gmail}
              onChange={(e) => handleFormChange("gmail", e.target.value)}
            />

            <label>Phone Numbers</label>
            {form.phones.map((p, i) => (
              <div key={i} className={styles.phoneRow}>
                <input
                  type="text"
                  value={p.phone_number}
                  className={styles.input}
                  style={{ marginBottom: "10px" }}
                  onChange={(e) => handlePhoneChange(i, e.target.value)}
                  placeholder={`Phone ${i + 1}`}
                />
                {form.phones.length > 1 && (
                  <button type="button" onClick={() => removePhone(i)}>
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPhone}
              className={styles.addPhoneBtn}
            >
              + Add Phone
            </button>

            <label>Title</label>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
            />

            <label>Address</label>
            <textarea
              rows={2}
              className={styles.input}
              value={form.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
            />
          </section>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
          >
            ADD
          </button>
        </form>
      </div>
    </Layout>
  );
}
