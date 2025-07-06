"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateCatalogPage() {
  const router = useRouter();
  const imageRef = useRef();

  const [form, setForm] = useState({
    name: "",
    isactive: true,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => form.name.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "Category name is required.", "warning");
      return;
    }

    const payload = {
      name: form.name,
      isactive: form.isactive,
      subcategories: [], // always empty as you required
    };

    Swal.fire({
      title: "Saving category...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Category created successfully.", "success");

      setForm({ name: "", isactive: true });
      imageRef.current?.reset?.();

      router.push("/categories");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while saving.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create New Category</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Category Name</label>
          <input
            type="text"
            className={styles.input}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

        
          <button
            type="submit"
            className="submitButton"
            disabled={!isFormValid()}
          >
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
