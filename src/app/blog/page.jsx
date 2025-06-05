"use client";

import { useEffect, useState } from "react";
import BlogTable from "@/components/BlogTable/BlogTable";
import Layout from "@/components/Layout";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchBlogs() {
    try {
      const res = await fetch("/api/blogs");
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setBlogs(data.data);
    } catch (err) {
      console.error(err);
      setError("Blog verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div>
      <Layout>
        <h1>Blog Yönetimi</h1>
        {loading && (
          <div className={"loadingSpinner"}>
            <div className={"spinner"} />
            <p>İçerikler yükleniyor...</p>
          </div>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <BlogTable blogs={blogs} fetchBlogs={fetchBlogs} />
        )}
      </Layout>
    </div>
  );
}
