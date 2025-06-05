"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./BlogTable.module.css";
import Cookies from "js-cookie";

// Yardımcı: objeyi langCode-value dizisine çevir
const convertToArrayFormat = (obj) =>
  Object.entries(obj || {}).map(([langCode, value]) => ({
    langCode,
    value,
  }));

export default function BlogTable({ blogs, fetchBlogs }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("title");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    if (!Array.isArray(blogs)) return [];
    const query = search.toLowerCase().trim();
    return blogs.filter((b) => {
      const title = b?.title?.tr || "";
      return title.toLowerCase().includes(query);
    });
  }, [search, blogs]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortField]?.tr?.toLowerCase?.() || a[sortField] || "";
      const valB = b[sortField]?.tr?.toLowerCase?.() || b[sortField] || "";
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Silmek istediğine emin misin?",
      text: "Bu işlem geri alınamaz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Siliniyor...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = Cookies.get("token");
      const res = await fetch(`/api/blogs?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      Swal.close();

      if (res.ok) {
        await Swal.fire("Silindi!", "Blog başarıyla silindi.", "success");
        fetchBlogs();
      } else {
        Swal.fire("Hata", result.error || "Silme işlemi başarısız", "error");
      }
    } catch {
      Swal.close();
      Swal.fire("Hata", "Bir hata oluştu", "error");
    }
  };

  const handleToggle = async (blog, field, newValue) => {
    const updatedBlog = {
      link: blog.link,
      thumbnail: blog.thumbnail,
      date: blog.date,
      author: blog.author,
      isactive: field === "isactive" ? newValue : blog.isactive,
      title: convertToArrayFormat(blog.title),
      details: convertToArrayFormat(blog.details),
      content: convertToArrayFormat(blog.content),
      category: convertToArrayFormat(blog.category),
      tags: blog.tags || [],
    };

    try {
      Swal.fire({
        title: "Güncelleniyor...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = Cookies.get("token");
      const res = await fetch(`/api/blogs?id=${blog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBlog),
      });

      if (!res.ok) throw new Error();
      Swal.fire("Başarılı", "Güncelleme tamamlandı", "success");
      fetchBlogs();
    } catch {
      Swal.close();
      Swal.fire("Hata", `${field} güncellenemedi`, "error");
    }
  };

  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.toolbar}>
        <div className={styles.leftControls}>
          <label>Sayfada</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(+e.target.value);
              setCurrentPage(1);
            }}
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <label>kayıt göster</label>
          <span className={styles.resultCount}>
            Bulunan: <b>{filtered.length}</b> kayıt
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Ara:</label>
          <input
            type="text"
            placeholder="Başlık ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/blog/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("title")}>
              Başlık{" "}
              {sortField === "title" ? (
                sortAsc ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : null}
            </th>
            <th>Kapak Görseli</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            paginated.map((blog, i) => (
              <tr key={blog.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{blog.title?.tr || "-"}</td>
                <td>
                  {blog.thumbnail ? (
                    <Image
                      src={
                        blog.thumbnail.startsWith("http")
                          ? blog.thumbnail
                          : "/"
                      }
                      alt="kapak"
                      width={50}
                      height={35}
                      className={styles.thumbnail}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={blog.isactive}
                      onChange={() =>
                        handleToggle(blog, "isactive", !blog.isactive)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>

                <td>
                  <Link href={`/blog/content-edit/${blog.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(blog.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? styles.active : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
