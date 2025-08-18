// ContactFormSubmissionsTable.js
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hour}:${minute}`;
}

export default function ContactFormSubmissionsTable() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(1000);
  const [currentPage, setCurrentPage] = useState(1);
  const token = Cookies.get("token");

  const fetchRecords = useCallback(async () => {
    const res = await fetch("/api/forms", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    setRecords(json);
  }, [token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = useMemo(() => {
    if (!Array.isArray(records)) return [];

    const q = search.toLowerCase();

    return records.filter(
      (r) =>
        (r.fullname || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
    );
  }, [records, search]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const handleClick = (id) => {
    window.location.href = `/form-data/content/${id}`;
  };
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const confirm = await Swal.fire({
      title: "Silmek istiyor musun?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
    });

    if (!confirm.isConfirmed) return;

    await fetch(`/api/forms?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchRecords();
    Swal.fire("Silindi", "Kayıt silindi.", "success");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.leftControls}>
          <label>Sayfada</label>
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
          <label>kayıt göster</label>
          <span className={styles.resultCount}>
            Bulunan: <b>{filtered.length}</b> kayıt
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Ara:</label>
          <input
            type="text"
            placeholder="İsim, e-posta, telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Ad Soyad</th>
            <th>GSM Numarasi</th>
            <th>E-posta</th>
            <th>Not</th>
            <th>Tarih</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((r, i) => (
            <tr key={r.id} onClick={() => handleClick(r.id)}>
              <td>{(currentPage - 1) * pageSize + i + 1}</td>
              <td>{r.userinfo}</td>
              <td>{r.gsm}</td>
              <td>{r.mail}</td>
              <td>{r.content}</td>
              <td>{formatDate(r.date || "")}</td>
              <td>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, r.id)}
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
