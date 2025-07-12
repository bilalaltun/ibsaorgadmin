"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import styles from "./BlogContentEditPage.module.css";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
const SimpleEditor = dynamic(() => import("@/package/App"), { ssr: false });

export default function BlogContentEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [staticFields, setStaticFields] = useState({
    link: "",
    thumbnail: "",
    date: "",
    author: "",
    isactive: false,
    show_at_home: false,
    tags: "",
    title: "",
    details: "",
    content: "",
    category_id: "",
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const json = await res.json();
        const activeCategories = json.data.filter((cat) => cat.isactive);
        setCategories(activeCategories);
      } catch (err) {
        console.error("❌ Failed to load categories:", err);
        Swal.fire("Error", "Could not load categories", "error");
      }
    }

    fetchCategories();
  }, []);

  // Fetch blog by ID
  useEffect(() => {
    async function fetchBlog() {
      const token = Cookies.get("token");
      try {
        const res = await fetch(`/api/blogs?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch blog");
        const data = await res.json();

        setStaticFields({
          link: data.link || "",
          thumbnail: data.thumbnail || "",
          date: data.date?.split("T")[0] || "",
          author: data.author || "",
          show_at_home: data.show_at_home,
          isactive: data.isactive,
          tags: (data.tags || []).join(", "),
          title: data.title || "",
          details: data.details || "",
          content: data.content || "",
          category_id: data.category_id || "",
        });
      } catch (err) {
        console.error("❌ Failed to load blog:", err);
        setError("Failed to fetch blog data.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [id]);

  const allowedCategories = Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))?.category_ids || []
    : [];

  const filteredCategories = categories.filter((category) =>
    allowedCategories.includes(category.id)
  );

  const handleChange = (key, value) => {
    setStaticFields((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    const {
      link,
      thumbnail,
      date,
      author,
      title,
      details,
      content,
      category_id,
    } = staticFields;
    return (
      link &&
      thumbnail &&
      date &&
      author &&
      title.trim() &&
      details.trim() &&
      content.trim() &&
      category_id
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
      link: staticFields.link,
      thumbnail: staticFields.thumbnail,
      date: staticFields.date,
      author: staticFields.author,
      isactive: staticFields.isactive,
      show_at_home: staticFields.show_at_home,
      title: staticFields.title,
      details: staticFields.details,
      content: staticFields.content,
      category_id: Number(staticFields.category_id),
      tags: staticFields.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/blogs?id=${id}`, {
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
        title: "Success!",
        text: `Blog #${id} was updated successfully.`,
      }).then(() => router.push("/blog"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while saving.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>📄 Edit Blog</h1>

        {loading ? (
          <div className={"loadingSpinner"}>
            <div className={"spinner"} />
            <p>Loading content...</p>
          </div>
        ) : (
          <div className={styles.editForm}>
            {error && <p className={styles.errorText}>{error}</p>}

            <section className={styles.section}>
              <h2>Blog Information</h2>

              <label>Cover Image</label>
              <UploadField
                type="image"
                accept="image/*"
                label="Choose Cover Image"
                value={staticFields.thumbnail}
                onChange={(url) => handleChange("thumbnail", url)}
                disabled={false}
                multiple={false}
              />

              <label>Date</label>
              <input
                type="date"
                value={staticFields.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />

              <label>Author</label>
              <input
                type="text"
                value={staticFields.author}
                onChange={(e) => handleChange("author", e.target.value)}
              />

              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={staticFields.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
              />

              <label>Category</label>
              <select
                value={staticFields.category_id || ""}
                onChange={(e) => handleChange("category_id", e.target.value)}
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
                value={staticFields.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />

              <label>Details</label>
              <input
                type="text"
                value={staticFields.details}
                onChange={(e) => handleChange("details", e.target.value)}
              />

              <label>Content</label>
              <SimpleEditor
                value={staticFields.content}
                onChange={(val) => handleChange("content", val)}
              />
            </section>

            <button onClick={handleSubmit} className={styles.submitButton}>
              Save
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
