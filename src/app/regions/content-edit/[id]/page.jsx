"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function EditRegionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    title: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRegion() {
      try {
        const res = await fetch(`/api/regions?id=${id}`);
        if (!res.ok) throw new Error("Region not found.");
        const data = await res.json();
        setForm({
          name: data.name || "",
          title: data.title || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load region data.");
      } finally {
        setLoading(false);
      }
    }

    fetchRegion();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => form.name.trim() && form.title.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Missing Information", "Both name and title are required.", "warning");
      return;
    }

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/regions?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Server error");

      Swal.fire("Success", "Region updated successfully.", "success").then(() =>
        router.push("/regions")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while updating the region.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Region</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
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
              UPDATE
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
