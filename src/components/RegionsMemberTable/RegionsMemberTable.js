"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function RegionMembersTable() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/region-members");
      const json = await res.json();
      setMembers(json.data || []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      Swal.fire("Error", "Failed to load region members", "error");
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
      text: "This will permanently delete the member.",
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
      const res = await fetch(`/api/region-members?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.close();

      if (res.ok) {
        await Swal.fire("Deleted!", "The member was removed.", "success");
        fetchMembers();
      } else {
        const { error } = await res.json();
        Swal.fire("Error", error || "Failed to delete", "error");
      }
    } catch {
      Swal.close();
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  // const handleToggleStatus = async (id, currentStatus, data) => {
  //   try {
  //     const token = Cookies.get("token");
  //     const res = await fetch(`/api/region-members?id=${id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ isactive: !currentStatus, ...data }),
  //     });

  //     if (!res.ok) {
  //       const { error } = await res.json();
  //       throw new Error(error || "Failed to update status");
  //     }

  //     fetchMembers();
  //   } catch (err) {
  //     console.error("Status update failed:", err);
  //     Swal.fire("Error", err.message || "Status update failed", "error");
  //   }
  // };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.region_name?.toLowerCase().includes(q)
    );
  }, [search, members]);

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
            Found: <b>{filtered.length}</b> members
          </span>
        </div>
        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search name, title or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/region-members/create">
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
            <th>Email</th>
            <th>Flag</th>
            <th onClick={() => handleSort("region_name")}>
              Region{" "}
              {sortField === "region_name" &&
                (sortAsc ? <FaSortUp /> : <FaSortDown />)}
            </th>
            {/* <th>Status</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "1rem" }}>
                No records found.
              </td>
            </tr>
          ) : (
            paginated.map((m, i) => (
              <tr key={m.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{m.name}</td>
                <td>{m.title}</td>
                <td>{m.email || "-"}</td>
                <td>
                  {m.flag_url ? (
                    <img src={m.flag_url} alt="flag" style={{ width: 24 }} />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{m.region_name || "-"}</td>
                {/* <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={m.isactive}
                      onChange={() => handleToggleStatus(m.id, m.isactive, m)}
                    />
                    <span className="slider round" />
                  </label>
                </td> */}
                <td>
                  <Link href={`/regions-members/content-edit/${m.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(m.id)}
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
