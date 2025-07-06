"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          `/api/categories?currentpage=${currentPage}&pagesize=${pageSize}`
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setCategories(data.data);
      } catch {
        setError("Failed to load category data.");
      }
    }
    fetchCategories();
  }, [currentPage, pageSize]);

  const filtered = useMemo(() => {
    return categories?.length > 0
      ? categories.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];
  }, [search, categories]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = (a[sortField] || "").toLowerCase();
      const valB = (b[sortField] || "").toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this category?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      Swal.fire("Deleted!", "Category deleted successfully.", "success");
    } catch {
      Swal.fire("Error", "An error occurred while deleting.", "error");
    }
  };

  if (error) return <p className="error">{error}</p>;

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
            {[5, 10, 15, 20].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <label>entries</label>
          <span className={styles.resultCount}>
            Total: <b>{filtered.length}</b> categories
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/categories/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("name")}>
              Name
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={3} className={styles.noData}>
                No records found.
              </td>
            </tr>
          ) : (
            paginated.map((category, i) => (
              <tr key={category.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{category.name}</td>
                <td>
                  <Link href={`/categories/content-edit/${category.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(category.id)}
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
