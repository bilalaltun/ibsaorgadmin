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

  async function fetchMenus() {
    try {
      const res = await fetch("/api/menus");
      if (!res.ok) throw new Error("Veri alınamadı.");
      const data = await res.json();
      setMenus(data.data);
    } catch {
      Swal.fire("Hata", "Menüler yüklenemedi", "error");
    }
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  const filtered = useMemo(() => {
    return menus.filter((menu) => {
      const title = menu.titles?.tr || Object.values(menu.titles || {})[0] || "";
      return title.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, menus]);

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
      const res = await fetch(`/api/menus?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setMenus((prev) => prev.filter((menu) => menu.id !== id));
      Swal.fire("Silindi", "Menü silindi", "success");
    } catch {
      Swal.fire("Hata", "Silme başarısız", "error");
    }
  };

  const handleToggle = async (menu) => {
    const updated = { ...menu, isactive: !menu.isactive };
    Swal.fire({
      title: "Güncelleniyor...",
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
      Swal.fire("Başarılı", "Menü durumu güncellendi.", "success");
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
            placeholder="Menü başlığı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/menus/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Başlık</th>
            <th>Link</th>
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
            paginated.map((menu, i) => (
              <tr key={menu.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{menu.titles?.tr || Object.values(menu.titles || {})[0]}</td>
                <td>{menu.url}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={menu.isactive ?? true}
                      onChange={() => handleToggle(menu)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
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
