/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function ReferansTable() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/references");
        if (!res.ok) throw new Error("Failed to fetch data.");
        const data = await res.json();
        setItems(data.data);
      } catch {
        setError("Failed to load references.");
      }
    }
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) =>
      (item.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      if (nameA < nameB) return sortAsc ? -1 : 1;
      if (nameA > nameB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this reference?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/references?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      Swal.fire("Deleted", "Reference has been deleted", "success");
    } catch {
      Swal.fire("Error", "Failed to delete reference", "error");
    }
  };

  const handleToggle = async (item) => {
    const updated = {
      img: item.img,
      name: item.name,
      isactive: !item.isactive,
      show_at_home: true,
    };

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/references?id=${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Update failed");

      setItems((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, isactive: updated.isactive } : p
        )
      );

      Swal.close();
    } catch {
      Swal.fire("Error", "Failed to update status.", "error");
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
            {[5, 10, 15, 20].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <label>entries per page</label>
          <span className={styles.resultCount}>
            Total: <b>{filtered.length}</b> records
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
          <Link href="/references/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th onClick={() => setSortAsc(!sortAsc)}>
              Name {sortAsc ? <FaSortUp /> : <FaSortDown />}
            </th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.noData}>
                No data found.
              </td>
            </tr>
          ) : (
            paginated.map((item, i) => (
              <tr key={item.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>
                  {item.img && (
                    <img src={item.img} alt="Reference" height={50} />
                  )}
                </td>
                <td>{item.name || "-"}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={item.isactive}
                      onChange={() => handleToggle(item)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/references/content-edit/${item.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
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
