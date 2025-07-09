"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Layout from "@/components/Layout";
import styles from "./styles.module.css";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/package/App"), { ssr: false });

export default function EditPageContent() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    link: "",
    isactive: true,
    menu_id: 0,
    submenu_id: 0,
    page_title: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    content: "",
  });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pages?id=${id}`);
        const json = await res.json();
        const item = json.data;

        setForm({
          link: item.link || "",
          isactive: item.isactive ?? true,
          menu_id: item.menu_id || 0,
          submenu_id: item.submenu_id || 0,
          page_title: item.page_title || "",
          meta_title: item.meta_title || "",
          meta_keywords: item.meta_keywords || "",
          meta_description: item.meta_description || "",
          content: item.content || "",
        });
      } catch {
        Swal.fire("Error", "Failed to fetch page data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return (
      form.link.trim() &&
      form.page_title.trim() &&
      form.meta_title.trim() &&
      form.meta_keywords.trim() &&
      form.meta_description.trim() &&
      form.content.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      Swal.fire("Warning", "Please fill in all required fields.", "warning");
      return;
    }

    Swal.fire({ title: "Updating...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");

      const payload = {
        link: form.link,
        isactive: form.isactive,
        menu_id: form.menu_id,
        submenu_id: form.submenu_id,
        page_title: form.page_title,
        meta_title: form.meta_title,
        meta_keywords: form.meta_keywords,
        meta_description: form.meta_description,
        content: form.content,
      };

      const res = await fetch(`/api/pages?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Page updated successfully.", "success").then(() =>
        router.push("/pages")
      );
    } catch {
      Swal.fire("Error", "Failed to update page.", "error");
    }
  };

  return (
    <Layout>
      <h1 className={styles.pageTitle}>📄 Edit Page</h1>
      <div className={styles.section}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <label>Link</label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => handleChange("link", e.target.value)}
              className={styles.input}
            />

            <label>Meta Title</label>
            <input
              type="text"
              value={form.meta_title}
              onChange={(e) => handleChange("meta_title", e.target.value)}
            />

            <label>Page Title</label>
            <input
              type="text"
              value={form.page_title}
              onChange={(e) => handleChange("page_title", e.target.value)}
            />

            <label>Meta Keywords</label>
            <input
              type="text"
              value={form.meta_keywords}
              onChange={(e) => handleChange("meta_keywords", e.target.value)}
            />

            <label>Meta Description</label>
            <textarea
              value={form.meta_description}
              onChange={(e) => handleChange("meta_description", e.target.value)}
            />

            <label>Content</label>
            <Editor
              value={form.content}
              onChange={(value) => handleChange("content", value)}
            />

            <button type="submit" className={styles.submitButton}>
              UPDATE
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
