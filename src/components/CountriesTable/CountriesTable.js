"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CountriesTable() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/countries");
      const json = await res.json();
      setCountries(json.data || []);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
      Swal.fire("Error", "Failed to load countries", "error");
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
      text: "This will permanently delete the country.",
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
      const res = await fetch(`/api/countries?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.close();

      if (res.ok) {
        await Swal.fire("Deleted!", "The country was removed.", "success");
        fetchCountries();
      } else {
        const { error } = await res.json();
        Swal.fire("Error", error || "Failed to delete", "error");
      }
    } catch {
      Swal.close();
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleToggleStatus = async (id, currentStatus, data) => {
    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/countries?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, isactive: !currentStatus }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to update status");
      }

      fetchCountries();
    } catch (err) {
      console.error("Status update failed:", err);
      Swal.fire("Error", err.message || "Status update failed", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.federation_name.toLowerCase().includes(q) ||
        c.region_name?.toLowerCase().includes(q)
    );
  }, [search, countries]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
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
            Found: <b>{filtered.length}</b> countries
          </span>
        </div>
        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search country, federation or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/countries/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("name")}>
              Country{" "}
              {sortField === "name" &&
                (sortAsc ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th>Federation</th>
            <th>Flag</th>
            <th>Region</th>
            {/* <th>Status</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={11} style={{ textAlign: "center", padding: "1rem" }}>
                No records found.
              </td>
            </tr>
          ) : (
            paginated.map((c, i) => (
              <tr key={c.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{c.name}</td>
                <td>{c.federation_name}</td>
                <td>
                  {c.flag_url ? (
                    <img src={c.flag_url} alt="flag" style={{ width: 24 }} />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{c.region_name || "-"}</td>
                {/* <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={c.isactive}
                      onChange={() => handleToggleStatus(c.id, c.isactive, c)}
                    />
                    <span className="slider round" />
                  </label>
                </td> */}
                <td>
                  <Link href={`/countries/content-edit/${c.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(c.id)}
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
