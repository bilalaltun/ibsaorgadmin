/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function MenuTable() {
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      if (!res.ok) throw new Error("Failed to fetch data.");
      const data = await res.json();
      setMenus(data.data);
    } catch {
      Swal.fire("Error", "Failed to load menus", "error");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const filtered = useMemo(() => {
    return menus.filter((menu) =>
      (menu.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, menus]);

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
      const res = await fetch(`/api/menus?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();
      setMenus((prev) => prev.filter((menu) => menu.id !== id));
      Swal.fire("Deleted", "Menu has been deleted", "success");
    } catch {
      Swal.fire("Error", "Failed to delete menu", "error");
    }
  };

  const handleToggle = async (menu) => {
    const updated = { ...menu, isactive: !menu.isactive };

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/menus?id=${menu.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error();
      await fetchMenus();
      Swal.fire("Success", "Menu status updated", "success");
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
          <label>records per page</label>
          <span className={styles.resultCount}>
            Total: <b>{filtered.length}</b> records
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search menu title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {menus.length > 0 ? (
            <></>
          ) : (
            <Link href="/menus/create">
              <button className={styles.btnAdd}>ADD NEW</button>
            </Link>
          )}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Link</th>
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
            paginated.map((menu, i) => (
              <tr key={menu.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{menu.title || "—"}</td>
                <td>{menu.url}</td>
                <td>
                  <Link href={`/menus/content-edit/${menu.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(menu.id)}
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
