"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";

export default function LinksTable() {
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to fetch data.");
      const data = await res.json();
      setLinks(data.data);
    } catch {
      Swal.fire("Error", "Failed to load links", "error");
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const filtered = useMemo(() => {
    return links.filter((link) =>
      (link.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, links]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure you want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/links?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      await fetchLinks();
      Swal.fire("Deleted", "Link has been deleted.", "success");
    } catch {
      Swal.fire("Error", "Failed to delete link", "error");
    }
  };

  const handleToggle = async (link) => {
    // Sadece güncellenebilir alanları gönder
    const updatable = {
      isactive: !link.isactive
    };
    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const res = await fetch(`/api/links?id=${link.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatable),
      });
      if (!res.ok) throw new Error();
      await fetchLinks();
      Swal.fire("Success", "Status updated successfully", "success");
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.wrapper}>
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
            Found: <b>{filtered.length}</b> records
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
          <Link href="/site-links/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Link</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.noData}>
                No records found
              </td>
            </tr>
          ) : (
            paginated.map((link, i) => (
              <tr key={link.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{link.name || "-"}</td>
                <td>
                  <a href={link.link} target="_blank" rel="noopener noreferrer">
                    {link.link}
                  </a>
                </td>
                <td>{formatDate(link.startDate)}</td>
                <td>{formatDate(link.endDate)}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={link.isactive}
                      onChange={() => handleToggle(link)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/site-links/content-edit/${link.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(link.id)}
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
