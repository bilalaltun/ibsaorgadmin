"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function PageTable() {
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) throw new Error("Failed to fetch pages.");
      const data = await res.json();
      setPages(data.data || []);
    } catch {
      Swal.fire("Error", "Failed to load pages", "error");
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const filtered = useMemo(() => {
    return pages.filter((page) =>
      (page.page_title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, pages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/pages?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setPages((prev) => prev.filter((page) => page.id !== id));
      Swal.fire("Deleted", "Page successfully deleted", "success");
    } catch {
      Swal.fire("Error", "Failed to delete page", "error");
    }
  };

  const handleToggle = async (page) => {
    const updated = { ...page, isactive: !page.isactive };
    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/pages?id=${page.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error();
      await fetchPages();
      Swal.fire("Success", "Status updated successfully", "success");
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.toolbar}>
        <div className={styles.leftControls}>
          <label>Show</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(+e.target.value);
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <label>entries per page</label>
          <span className={styles.resultCount}>
            Total: <b>{filtered.length}</b> entries
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search page title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/pages/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Page Title</th>
            <th>Link</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                No records found
              </td>
            </tr>
          ) : (
            paginated.map((page, i) => (
              <tr key={page.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{page.page_title || "-"}</td>
                <td>{page.link}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={page.isactive ?? true}
                      onChange={() => handleToggle(page)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/pages/content-edit/${page.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(page.id)}
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
