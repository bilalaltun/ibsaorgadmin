"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditCatalogPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    isactive: true,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch category.");
        const data = await res.json();
        setForm({
          name: data.name || "",
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error("Failed to load category:", err);
        setError("Category not found.");
      }
    }

    fetchCategory();
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
      order: form.order,
      isactive: form.isactive,
      subcategories: [], // always send as empty
    };

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/categories?id=${id}`, {
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
        text: "Category updated successfully.",
      }).then(() => router.push("/categories"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the category.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Category</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Category Name</label>
          <input
            className={styles.input}
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
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
