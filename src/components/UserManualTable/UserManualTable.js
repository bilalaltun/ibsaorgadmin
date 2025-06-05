/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function CatalogTable() {
  const [catalogs, setCatalogs] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function fetchCatalogs() {
      try {
        const res = await fetch("/api/usermanual");
        if (!res.ok) throw new Error("Veri alınamadı.");
        const data = await res.json();
        setCatalogs(data);
      } catch {
        setError("Kullanım Kılavuzu verileri alınamadı.");
      }
    }
    fetchCatalogs();
  }, []);

  const filtered = useMemo(() => {
    return catalogs.filter((c) => {
      const title = c.title?.tr || "";
      return title.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, catalogs]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a.title?.tr?.toLowerCase() || "";
      const valB = b.title?.tr?.toLowerCase() || "";
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = () => setSortAsc((prev) => !prev);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bu Kullanım Kılavuzu silinsin mi?",
      text: "Bu işlem geri alınamaz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Siliniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const token = Cookies.get("token");

      const res = await fetch(`/api/usermanual?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Silme başarısız");
      setCatalogs((prev) => prev.filter((c) => c.id !== id));
      Swal.fire("Silindi!", "Kullanım Kılavuzu başarıyla silindi.", "success");
    } catch {
      Swal.fire("Hata", "Silme işlemi sırasında sorun oluştu.", "error");
    }
  };

  return (
    <div className={styles.tableWrapper}>
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
          <Link href="/usermanual/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={handleSort}>
              Başlık (TR) {sortAsc ? <FaSortUp /> : <FaSortDown />}
            </th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.noData}>
                Kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            paginated.map((catalog, i) => (
              <tr key={catalog.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>
                  {catalog.translations.find((t) => t.lang_code === "tr")
                    ?.title || "-"}
                </td>
                <td>
                  <Link href={`/usermanual/content-edit/${catalog.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(catalog.id)}
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
