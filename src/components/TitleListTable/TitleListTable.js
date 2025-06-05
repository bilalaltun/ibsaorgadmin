// TitleListTable.js
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";

export default function TitleListTable() {
  const [titles, setTitles] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTitles = async () => {
    const res = await fetch("/api/sitetags");
    const json = await res.json();
    setTitles(json);
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(titles)) return [];

    return titles.filter((item) =>
      item.title?.tr?.toLowerCase().includes(search.toLowerCase())
    );
  }, [titles, search]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Silmek istiyor musun?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
    });

    if (!confirm.isConfirmed) return;

    await fetch(`/api/sitetags?id=${id}`, { method: "DELETE" });
    await fetchTitles();
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
            placeholder="Başlık ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/etikets/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Başlık</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((t, i) => (
            <tr key={t.id}>
              <td>{(currentPage - 1) * pageSize + i + 1}</td>
              <td>{t.title.tr}</td>
              <td>
                <Link href={`/etikets/content-edit/${t.id}`}>
                  <button className={styles.editBtn}>
                    <FaPen />
                  </button>
                </Link>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(t.id)}
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
