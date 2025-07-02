"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateEventPage() {
  const router = useRouter();
  const imageRef = useRef();
  const fileRef = useRef();
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    start_date: "",
    end_date: "",
    category_id: "",
    location: "",
    sanction_type: "",
    contact_email: "",
    image_url: "",
    description: "",
    downloads: "",
    isactive: true,
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        const data = await json.data;
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.start_date ||
      !form.end_date ||
      !form.category_id ||
      !form.location ||
      !form.contact_email ||
      !form.image_url ||
      !form.description
    ) {
      Swal.fire("Warning", "Please fill in all required fields.", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Event created successfully.", "success");
      router.push("/events");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while saving.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create New Event</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Title</label>
          <input
            className={styles.input}
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <label>Start Date</label>
          <input
            className={styles.input}
            type="date"
            value={form.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
          />

          <label>End Date</label>
          <input
            className={styles.input}
            type="date"
            value={form.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
          />

          <label>Category</label>
          <select
            className={styles.input}
            value={form.category_id}
            onChange={(e) => handleChange("category_id", +e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Location</label>
          <input
            className={styles.input}
            type="text"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />

          <label>Sanction Type</label>
          <input
            className={styles.input}
            type="text"
            value={form.sanction_type}
            onChange={(e) => handleChange("sanction_type", e.target.value)}
          />

          <label>Contact Email</label>
          <input
            className={styles.input}
            type="email"
            value={form.contact_email}
            onChange={(e) => handleChange("contact_email", e.target.value)}
          />

          <label>Cover Image</label>
          <UploadField
            ref={imageRef}
            type="image"
            accept="image/*"
            value={form.image_url}
            label="Upload Image"
            onChange={(url) => handleChange("image_url", url)}
          />

          <label>Description</label>
          <textarea
            className={styles.textarea}
            rows={5}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <label>Download File (PDF)</label>
          <UploadField
            ref={fileRef}
            type="file"
            accept="application/pdf"
            label="Upload PDF"
            onChange={(url) =>
              handleChange(
                "downloads",
                JSON.stringify([{ title: "Invitation", url }])
              )
            }
          />

          <button type="submit" className={"submitButton"}>
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
