"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./CreateBlogPage.module.css";

const Editor = dynamic(() => import("@/package/App"), { ssr: false });

export default function CreateBlogPage() {
  const imageRef = useRef();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    link: "",
    thumbnail: "",
    date: new Date().toISOString().slice(0, 10),
    author: "",
    isactive: false,
    show_at_home: false,
    tags: "",
    title: "",
    details: "",
    content: "",
    category_id: "",
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const json = await res.json();
        const active = json.data.filter((cat) => cat.isactive);
        setCategories(active);
      } catch (err) {
        console.error("❌ Error loading categories:", err);
        Swal.fire("Error", "Failed to load categories", "error");
      }
    }

    fetchCategories();
  }, []);

  const allowedCategories = Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))?.category_ids || []
    : [];

  const filteredCategories = categories.filter((category) =>
    allowedCategories.includes(category.id)
  );

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return (
      form.link.trim() &&
      form.thumbnail.trim() &&
      form.date.trim() &&
      form.author.trim() &&
      form.tags.trim() &&
      form.title.trim() &&
      form.details.trim() &&
      form.content.trim() &&
      form.category_id
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
      });
      return;
    }

    const payload = {
      link: form.link,
      thumbnail: form.thumbnail,
      date: form.date,
      author: form.author,
      isactive: form.isactive,
      show_at_home: form.show_at_home,
      title: form.title,
      details: form.details,
      content: form.content,
      category_id: Number(form.category_id),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    Swal.fire({
      title: "Adding blog...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Blog could not be added.");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Blog was added successfully.",
      }).then(() => {
        window.location.href = "/blog";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving the blog.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Add New Blog</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <label>Cover Image</label>
            <UploadField
              type="image"
              ref={imageRef}
              accept="image/*"
              label="Upload Image"
              value={form.thumbnail}
              onChange={(url) => handleFormChange("thumbnail", url)}
            />

            <label>Slug / Link</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. blog/ipsa-cnc-tech"
              value={form.link}
              onChange={(e) => {
                const rawValue = e.target.value;
                const sanitizedValue = rawValue
                  .toLowerCase()
                  .replace(/[^a-z0-9\-\/]/g, "");
                handleFormChange("link", sanitizedValue);
              }}
            />

            <label>Date</label>
            <input
              type="date"
              className={styles.input}
              value={form.date}
              onChange={(e) => handleFormChange("date", e.target.value)}
            />

            <label>Author</label>
            <input
              type="text"
              className={styles.input}
              value={form.author}
              onChange={(e) => handleFormChange("author", e.target.value)}
            />

            <label>Tags (comma separated)</label>
            <input
              type="text"
              className={styles.input}
              value={form.tags}
              onChange={(e) => handleFormChange("tags", e.target.value)}
            />

            <label>Category</label>
            <select
              value={form.category_id || ""}
              onChange={(e) => handleFormChange("category_id", e.target.value)}
              className={styles.input}
            >
              <option value="">Select a category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </section>

          <section className={styles.section}>
            <h2>Content</h2>

            <label>Title</label>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
            />

            <label>Details</label>
            <input
              type="text"
              className={styles.input}
              value={form.details}
              onChange={(e) => handleFormChange("details", e.target.value)}
            />

            <label>Content</label>
            <Editor
              value={form.content}
              onChange={(val) => handleFormChange("content", val)}
            />
          </section>

          <button
            type="submit"
            className={"submitButton"}
            disabled={!isFormValid()}
          >
            Add Blog
          </button>
        </form>
      </div>
    </Layout>
  );
}
