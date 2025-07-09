"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import styles from "./styles.module.css";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
const SimpleEditor = dynamic(() => import("@/package/App"), { ssr: false });

export default function CreatePage() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    menu_id: 0,
    submenu_id: 0,
    link: "",
    isactive: true,
    page_title: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    content: "",
  });

  useEffect(() => {
    async function loadMenus() {
      try {
        const menuRes = await fetch("/api/menus");
        const menuData = await menuRes.json();
        setMenus(menuData.data || []);
      } catch (err) {
        console.error("Error loading menus:", err);
      }
    }

    loadMenus();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = () => {
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

    if (!isValid()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
      });
      return;
    }

    Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Page successfully created.",
      }).then(() => {
        window.location.href = "/pages";
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create page.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create New Page</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="link">Page URL</label>
          <input
            id="link"
            type="text"
            className={styles.input}
            value={form.link}
            onChange={(e) => handleChange("link", e.target.value)}
          />
          <label htmlFor="metaTitle">Meta Title</label>
          <input
            id="metaTitle"
            type="text"
            className={styles.input}
            value={form.meta_title}
            onChange={(e) => handleChange("meta_title", e.target.value)}
          />

          <label htmlFor="pageTitle">Page Title</label>
          <input
            id="pageTitle"
            type="text"
            className={styles.input}
            value={form.page_title}
            onChange={(e) => handleChange("page_title", e.target.value)}
          />

          <label htmlFor="metaKeywords">Meta Keywords</label>
          <input
            id="metaKeywords"
            type="text"
            className={styles.input}
            value={form.meta_keywords}
            onChange={(e) => handleChange("meta_keywords", e.target.value)}
          />

          <label htmlFor="metaDescription">Meta Description</label>
          <textarea
            id="metaDescription"
            rows={3}
            className={styles.input}
            value={form.meta_description}
            onChange={(e) => handleChange("meta_description", e.target.value)}
          />

          <label htmlFor="content">Content</label>
          <SimpleEditor
            value={form.content}
            onChange={(val) => handleChange("content", val)}
          />

          <button type="submit" className={styles.submitButton}>
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
