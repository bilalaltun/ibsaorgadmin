"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditReferansPage() {
  const { id } = useParams();
  const router = useRouter();
  const imageRef = useRef();

  const [form, setForm] = useState({
    img: "",
    name: "",
    isactive: true,
    show_at_home: true,
  });

  const [loading, setLoading] = useState(true);

  // Fetch existing data
  useEffect(() => {
    async function fetchReferans() {
      try {
        const res = await fetch(`/api/references?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch data.");
        const json = await res.json();
        const data = json.data;

        setForm({
          img: data.img || "",
          name: data.name || "",
          isactive: data.isactive ?? true,
          show_at_home: data.show_at_home ?? true,
        });
      } catch (err) {
        Swal.fire("Error", "Failed to load Partner data.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchReferans();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => form.img && form.name.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    const payload = {
      img: form.img,
      name: form.name,
      isactive: form.isactive,
      show_at_home: true,
    };

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/references?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Partner has been updated.", "success").then(() => {
        router.push("/references");
      });
    } catch {
      Swal.fire("Error", "Update failed.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Patner #{id}</h2>

        {loading ? (
          <div className="loadingSpinner">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>Image</label>
            <UploadField
              ref={imageRef}
              type="image"
              accept="image/*"
              value={form.img}
              onChange={(url) => handleChange("img", url)}
              label="Select Image"
            />

            <label>Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Partner Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isFormValid()}
            >
              UPDATE
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
