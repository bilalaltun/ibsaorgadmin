"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EventTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  const fetchEvents = async () => {
    const categories = JSON.parse(Cookies.get("user"))?.category_ids;

    try {
      setLoading(true);
      const res = await fetch("/api/events");
      const json = await res.json();
      const data = json.data;

      if (categories && categories.length === 0) {
        setEvents(data);
      } else {
        const filteredEvents = data.filter((event) =>
          categories.includes(event?.category_id)
        );
        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      Swal.fire("Error", "Failed to fetch events", "error");
    } finally {
      setLoading(false);
    }
  };

  function formatDate(
    dateStr,
    locale = "en-GB",
    options = { day: "2-digit", month: "short", year: "numeric" }
  ) {
    if (!dateStr) return "-";
    try {
      return new Intl.DateTimeFormat(locale, options).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events?.filter((e) => e.title?.toLowerCase().includes(q)) || [];
  }, [search, events]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = (a[sortField] || "").toLowerCase?.() || "";
      const valB = (b[sortField] || "").toLowerCase?.() || "";
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
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.close();

      if (res.ok) {
        await Swal.fire("Deleted!", "The event has been deleted.", "success");
        fetchEvents();
      } else {
        const { error } = await res.json();
        Swal.fire("Error", error || "Failed to delete", "error");
      }
    } catch {
      Swal.close();
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleToggle = async (event, field, newValue) => {
    const payload = {
      ...event,
      isactive: field === "isactive" ? newValue : event.isactive,
    };

    try {
      Swal.fire({
        title: "Updating...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch(`/api/events?id=${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      Swal.fire("Success", "Event status updated", "success");
      fetchEvents();
    } catch {
      Swal.close();
      Swal.fire("Error", "Status update failed", "error");
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
          <label>per page</label>
          <span className={styles.resultCount}>
            Found: <b>{filtered.length}</b> events
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
          <Link href="/events/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "2rem" }}>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => handleSort("title")}>
                Title{" "}
                {sortField === "title" &&
                  (sortAsc ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th>Start</th>
              <th>End</th>
              <th>Location</th>
              <th>Sanction</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No records found.
                </td>
              </tr>
            ) : (
              paginated.map((event, i) => (
                <tr key={event.id}>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>{event.title}</td>
                  <td>{formatDate(event.start_date)}</td>
                  <td>{formatDate(event.end_date)}</td>
                  <td>{formatDate(event.location)}</td>
                  <td>{event.sanction_type}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={event.isactive}
                        onChange={() =>
                          handleToggle(event, "isactive", !event.isactive)
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <Link href={`/events/content-edit/${event.id}`}>
                      <button className={styles.editBtn}>
                        <FaPen />
                      </button>
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(event.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {!loading && totalPages > 1 && (
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
