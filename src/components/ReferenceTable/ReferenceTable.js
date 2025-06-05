/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

// Yardımcı fonksiyon: name objesini diziye çevir
const convertToArrayFormat = (obj) =>
  Object.entries(obj || {}).map(([langCode, value]) => ({
    langCode,
    value,
  }));

export default function ReferansTable() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/references");
        if (!res.ok) throw new Error("Veri alınamadı.");
        const data = await res.json();
        setItems(data.data);
      } catch {
        setError("Referanslar alınamadı.");
      }
    }
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) =>
      (item.name?.tr || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const nameA = a.name?.tr?.toLowerCase() || "";
      const nameB = b.name?.tr?.toLowerCase() || "";
      if (nameA < nameB) return sortAsc ? -1 : 1;
      if (nameA > nameB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

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
      const res = await fetch(`/api/references?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      Swal.fire("Silindi", "Referans silindi", "success");
    } catch {
      Swal.fire("Hata", "Silme başarısız", "error");
    }
  };

  const handleToggle = async (item) => {
    const updated = {
      img: item.img,
      name: convertToArrayFormat(item.name),
      isactive: !item.isactive,
      show_at_home: true, // her zaman true gönderiyoruz
    };

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/references?id=${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Güncelleme hatası");

      setItems((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, isactive: updated.isactive } : p
        )
      );

      Swal.close();
    } catch {
      Swal.fire("Hata", "Aktiflik durumu güncellenemedi.", "error");
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
            Toplam: <b>{filtered.length}</b> kayıt
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Ara:</label>
          <input
            type="text"
            placeholder="İsim ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/references/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Görsel</th>
            <th onClick={() => setSortAsc(!sortAsc)}>
              İsim {sortAsc ? <FaSortUp /> : <FaSortDown />}
            </th>
            <th>Aktif</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.noData}>
                Kayıt yok
              </td>
            </tr>
          ) : (
            paginated.map((item, i) => (
              <tr key={item.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>
                  {item.img && (
                    <Image
                      src={item.img}
                      alt="Referans"
                      width={70}
                      height={50}
                      unoptimized
                    />
                  )}
                </td>
                <td>{item.name?.tr || "-"}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={item.isactive}
                      onChange={() => handleToggle(item)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/references/content-edit/${item.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
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
