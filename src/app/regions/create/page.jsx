"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateRegionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    title: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.title.trim()) {
      Swal.fire("Warning", "Please fill in both name and title.", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch("/api/regions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Region created successfully.", "success").then(() =>
        router.push("/regions")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while saving.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create New Region</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Name</label>
          <input
            className={styles.input}
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <label>Title</label>
          <input
            className={styles.input}
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <button type="submit" className="submitButton">
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
