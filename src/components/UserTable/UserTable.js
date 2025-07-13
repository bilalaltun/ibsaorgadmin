"use client";

import { useState, useMemo, useEffect } from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import styles from "./UserTable.module.css";
import Link from "next/link";
import Cookies from "js-cookie";

export default function UserTable() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const token = Cookies.get("token");
    const res = await fetch("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    setUsers(json);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (!search) return users;

    return users.filter((u) =>
      u.username?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

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

    const token = Cookies.get("token");

    await fetch(`/api/users?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchUsers();
    Swal.fire("Deleted", "User has been deleted.", "success");
  };

  const handleToggle = async (user) => {
    const updated = { ...user, isactive: !user.isactive };

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/users?id=${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error();

      await fetchUsers();
      Swal.fire("Success", "Status updated successfully.", "success");
    } catch {
      Swal.fire("Error", "Failed to update status.", "error");
    }
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
            Found: <b>{filtered.length}</b> users
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/users/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((u, i) => (
            <tr key={u.id}>
              <td>{(currentPage - 1) * pageSize + i + 1}</td>
              <td>{u.username}</td>
              <td>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={u.isactive}
                    onChange={() => handleToggle(u)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </td>

              <td>
                <Link href={`/users/content-edit/${u.id}`}>
                  <button className={styles.editBtn}>
                    <FaPen />
                  </button>
                </Link>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(u.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
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
