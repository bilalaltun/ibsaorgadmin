/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";
import styles from "./styles.module.css";
import Image from "next/image";

export default function LanguagesTable() {
  const [languages, setLanguages] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchLanguages() {
    try {
      const res = await fetch("/api/languages");
      if (!res.ok) throw new Error("Veri alınamadı.");
      const data = await res.json();
      setLanguages(data);
    } catch {
      Swal.fire("Hata", "Diller yüklenemedi", "error");
    }
  }

  useEffect(() => {
    fetchLanguages();
  }, []);

  const filtered = useMemo(() => {
    return languages.filter((lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, languages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (!result.isConfirmed) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/languages?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setLanguages((prev) => prev.filter((lang) => lang.id !== id));
      Swal.fire("Silindi", "Dil silindi", "success");
    } catch {
      Swal.fire("Hata", "Silme başarısız", "error");
    }
  };

  const handleToggle = async (lang) => {
    const updated = { ...lang, isactive: !lang.isactive };

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/languages?id=${lang.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error();

      await fetchLanguages();
      Swal.fire("Başarılı", "Dil durumu güncellendi.", "success");
    } catch (err) {
      Swal.fire("Hata", "Güncelleme başarısız", "error");
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
            {[5, 10, 20].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <label>kayıt göster</label>
          <span className={styles.resultCount}>
            Toplam: <b>{filtered.length}</b> kayıt
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Ara:</label>
          <input
            type="text"
            placeholder="Dil adı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/languages/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Dil</th>
            <th>URL</th>
            <th>Aktif</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                Kayıt yok
              </td>
            </tr>
          ) : (
            paginated.map((lang, i) => (
              <tr key={lang.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{lang.name}</td>
                <td>
                  {lang.url ? (
                    <Image
                      src={lang.url.startsWith("http") ? lang.url : `/`}
                      alt={lang.name}
                      width={80}
                      height={50}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={lang.isactive ?? true}
                      onChange={() => handleToggle(lang)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/languages/content-edit/${lang.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(lang.id)}
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
