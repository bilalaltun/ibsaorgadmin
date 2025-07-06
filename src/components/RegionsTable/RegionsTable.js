"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function RegionsTable() {
  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("title");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await fetch("/api/regions");
      const json = await res.json();
      setRegions(json.data || []);
    } catch (error) {
      console.error("Failed to fetch regions:", error);
      Swal.fire("Error", "Failed to load regions", "error");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch(`/api/regions?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.close();

      if (res.ok) {
        await Swal.fire("Deleted!", "The region has been deleted.", "success");
        fetchRegions();
      } else {
        const { error } = await res.json();
        Swal.fire("Error", error || "Failed to delete", "error");
      }
    } catch {
      Swal.close();
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return regions.filter((r) => r.title.toLowerCase().includes(q));
  }, [search, regions]);

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
          <label>per page</label>

          <span className={styles.resultCount}>
            Found: <b>{filtered.length}</b> regions
          </span>
        </div>
        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/regions/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("name")}>
              Name{" "}
              {sortField === "name" &&
                (sortAsc ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th onClick={() => handleSort("title")}>
              Title{" "}
              {sortField === "title" &&
                (sortAsc ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                No records found.
              </td>
            </tr>
          ) : (
            paginated.map((region, i) => (
              <tr key={region.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{region.name}</td>
                <td>{region.title}</td>
                <td>
                  <Link href={`/regions/content-edit/${region.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(region.id)}
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
