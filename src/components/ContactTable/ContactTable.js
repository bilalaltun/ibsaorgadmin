"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function LocationTable() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchLocations() {
    try {
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error("Failed to fetch data.");
      const data = await res.json();
      setLocations(data.data);
    } catch {
      Swal.fire("Error", "Failed to fetch locations.", "error");
    }
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = useMemo(() => {
    return locations.filter((item) =>
      (item.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, locations]);

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
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/contacts?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      Swal.fire("Deleted", "Location has been deleted", "success");
    } catch {
      Swal.fire("Error", "Failed to delete location", "error");
    }
  };

  const handleToggle = async (loc) => {
    const updated = {
      id: loc.id,
      gmail: loc.gmail,
      isactive: !loc.isactive,
      title: loc.title,
      address: loc.address,
      phones: loc.phones || [],
    };

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/contacts?id=${loc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error();

      await fetchLocations();
      Swal.fire("Success", "Status updated successfully.", "success");
    } catch (err) {
      console.error(err);
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
            {[5, 10, 20].map((n) => (
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
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Address</th>
            <th>Email</th>
            <th>Phones</th>
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
            paginated.map((item, i) => (
              <tr key={item.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{item.title || "-"}</td>
                <td>{item.address || "-"}</td>
                <td>{item.gmail || "-"}</td>
                <td>
                  <ul className={styles.phoneList}>
                    {item.phones?.map((p, idx) => (
                      <li key={idx}>{p.phone_number}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <Link href={`/contact-details/content-edit/${item.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
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
