/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./SliderTable.module.css";
import Cookies from "js-cookie";

export default function SliderTable() {
  const [sliders, setSliders] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("titles");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function fetchSliders() {
      try {
        const res = await fetch("/api/sliders");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSliders(data.data);
      } catch {
        setError("Failed to load sliders.");
      }
    }
    fetchSliders();
  }, []);

  const filtered = useMemo(() => {
    return sliders?.length > 0
      ? sliders.filter((s) => {
          const title = s.titles || "";
          return title.toLowerCase().includes(search.toLowerCase());
        })
      : [];
  }, [search, sliders]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a.titles?.toLowerCase?.() || "";
      const valB = b.titles?.toLowerCase?.() || "";
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
      title: "Delete this slider?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/sliders?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSliders((prev) => prev.filter((s) => s.id !== id));
      Swal.fire("Deleted", "Slider deleted successfully.", "success");
    } catch {
      Swal.fire("Error", "An error occurred while deleting.", "error");
    }
  };

  const handleToggleActive = async (slider) => {
    const updated = { ...slider, isactive: !slider.isactive };

    Swal.fire({
      title: "Updating status...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/sliders?id=${slider.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image_url: updated.image_url,
          video_url: updated.video_url,
          dynamic_link_title: updated.dynamic_link_title,
          dynamic_link: updated.dynamic_link,
          dynamic_link_alternative: updated.dynamic_link_alternative,
          order: updated.order,
          isactive: updated.isactive,
          titles: updated.titles,
          description: updated.description,
          content: updated.content,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      setSliders((prev) =>
        prev.map((s) =>
          s.id === slider.id ? { ...s, isactive: updated.isactive } : s
        )
      );
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Status update failed", "error");
    }
  };

  if (error) return <p className="error">{error}</p>;

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
          <label>records per page</label>
          <span className={styles.resultCount}>
            Total: <b>{filtered.length}</b>
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/slider/sort">
            <button className={styles.btnAdd}>SORT</button>
          </Link>
          <Link href="/slider/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("titles")}>
              Title{" "}
              {sortField === "titles" ? (
                sortAsc ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : null}
            </th>
            <th>Image</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                No records found.
              </td>
            </tr>
          ) : (
            paginated.map((slider, i) => (
              <tr key={slider.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{slider.titles || "-"}</td>
                <td>
                  {slider.image_url && (
                    <img src={slider.image_url} className="image" />
                  )}
                </td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={slider.isactive}
                      onChange={() => handleToggleActive(slider)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/slider/content-edit/${slider.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(slider.id)}
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
