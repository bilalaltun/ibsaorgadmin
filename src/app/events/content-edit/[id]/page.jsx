"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function EditEventPage() {
  const { id } = useParams();
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
    contact_name: "",
    contact_number: "",
    image_url: "",
    description: "",
    downloads: [], // array of { title, url }
    isactive: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        setCategories(json.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events?id=${id}`);
        if (!res.ok) throw new Error("Event not found.");
        const data = await res.json();
        const event = Array.isArray(data.data) ? data.data[0] : data;
        setForm({
          ...event,
          contact_name: event.Contact_name,
          contact_number: event.Contact_number,
          downloads: event.downloads || [],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load event data.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownloadChange = (index, key, value) => {
    const updated = [...form.downloads];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, downloads: updated }));
  };

  const addDownload = () => {
    setForm((prev) => ({
      ...prev,
      downloads: [...prev.downloads, { title: "", url: "" }],
    }));
  };

  const removeDownload = (index) => {
    const updated = [...form.downloads];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, downloads: updated }));
  };

  const isFormValid = () => {
    return (
      form.title &&
      form.start_date &&
      form.end_date &&
      form.location &&
      form.sanction_type &&
      form.contact_email &&
      form.image_url &&
      form.description &&
      form.downloads.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire(
        "Missing Information",
        "All required fields must be filled.",
        "warning"
      );
      return;
    }

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/events?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Server error");

      Swal.fire("Success", "Event updated successfully.", "success").then(() =>
        router.push("/events")
      );
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "An error occurred while updating the event.",
        "error"
      );
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Event</h2>

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
            value={toInputDate(form.start_date)}
            onChange={(e) => handleChange("start_date", e.target.value)}
          />

          <label>End Date</label>
          <input
            className={styles.input}
            type="date"
            value={toInputDate(form.end_date)}
            onChange={(e) => handleChange("end_date", e.target.value)}
          />

          <label>Category</label>
          <select
            className={styles.input}
            value={form.category_id || ""}
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

          <label>Contact Name</label>
          <input
            className={styles.input}
            type="text"
            value={form.contact_name || ""}
            onChange={(e) => handleChange("contact_name", e.target.value)}
          />

          <label>Contact Number</label>
          <input
            className={styles.input}
            type="text"
            value={form.contact_number || ""}
            onChange={(e) => handleChange("contact_number", e.target.value)}
          />

          <label>Cover Image</label>
          <UploadField
            ref={imageRef}
            type="image"
            accept="image/*"
            value={form.image_url}
            label="Upload Cover Image"
            onChange={(url) => handleChange("image_url", url)}
          />

          <label>Description</label>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <label>Download Files</label>
          {form.downloads.map((file, index) => (
            <div key={index} className={styles.fileCard}>
              <div className={styles.fileInputs}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="File title"
                  value={file.title}
                  onChange={(e) =>
                    handleDownloadChange(index, "title", e.target.value)
                  }
                />
                <UploadField
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  value={file.url}
                  label="Upload PDF"
                  onChange={(url) => handleDownloadChange(index, "url", url)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDownload(index)}
                className={styles.removeFileButton}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addDownload}
            className={styles.addBtn}
          >
            + Add File
          </button>

          <button type="submit" className="submitButton">
            UPDATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
