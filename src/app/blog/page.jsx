"use client";

import { useEffect, useState } from "react";
import BlogTable from "@/components/BlogTable/BlogTable";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";
export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  async function fetchBlogs() {
    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/blogs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setBlogs(data.data);
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div>
      <Layout>
        <h1>Blog Management</h1>
        <BlogTable blogs={blogs} fetchBlogs={fetchBlogs} />
      </Layout>
    </div>
  );
}
