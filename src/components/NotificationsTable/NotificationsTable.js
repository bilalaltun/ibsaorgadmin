"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./styles.module.css";
import { db } from "../../lib/db";
import Link from "next/link";

export default function NotificationsTable() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "notification"),
        orderBy("notificationDate", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire("Error", "Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the notification.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "notification", id));
      Swal.fire("Deleted!", "Notification deleted.", "success");
      fetchNotifications();
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Error", "Could not delete notification.", "error");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return notifications.filter(
      (n) =>
        n.notificationTitle.toLowerCase().includes(q) ||
        n.notificationMessage.toLowerCase().includes(q)
    );
  }, [search, notifications]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateA = new Date(
        a.notificationDate?.toDate?.() || a.notificationDate
      );
      const dateB = new Date(
        b.notificationDate?.toDate?.() || b.notificationDate
      );
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [filtered, sortAsc]);

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
            {[5, 10, 20].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <label>per page</label>
          <span className={styles.resultCount}>
            Total: <b>{filtered.length}</b> notifications
          </span>
        </div>
        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search title or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/notifications/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => setSortAsc(!sortAsc)}
              style={{ cursor: "pointer" }}
            >
              Date {sortAsc ? <FaSortUp /> : <FaSortDown />}
            </th>
            <th>Title</th>
            <th>Message</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                No notifications found.
              </td>
            </tr>
          ) : (
            paginated.map((n, i) => (
              <tr key={n.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>
                  {new Date(
                    n.notificationDate?.toDate?.() || n.notificationDate
                  ).toLocaleString()}
                </td>
                <td>{n.notificationTitle}</td>
                <td>{n.notificationMessage}</td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(n.id)}
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
