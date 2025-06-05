/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./CatalogTable.module.css";
import Cookies from "js-cookie";

export default function CatalogTable() {
  const [catalogs, setCatalogs] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCatalogs = async () => {
    try {
      const res = await fetch(
        `/api/catalogs?currentPage=${currentPage}&pageSize=${pageSize}`
      );
      if (!res.ok) throw new Error("Kataloglar alınamadı.");
      const result = await res.json();
      setCatalogs(result?.data || []);
      setTotalPages(result?.pagination?.totalPagesCount || 1);
      setTotalCount(result?.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      Swal.fire("Hata", "Kataloglar yüklenemedi.", "error");
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, [currentPage, pageSize]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Silmek istiyor musun?",
      text: "Bu işlem geri alınamaz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: "Siliniyor...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = Cookies.get("token");
      const res = await fetch(`/api/catalogs?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Silinemedi");
      await fetchCatalogs();
      Swal.fire("Silindi", "Katalog silindi.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Katalog silinirken sorun oluştu.", "error");
    }
  };

 const convertToArrayFormat = (obj) =>
  Object.entries(obj || {}).map(([langCode, value]) => ({
    langCode,
    value,
  }));

const handleToggle = async (item) => {
  try {
    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const payload = {
      cover_img: item.cover_img,
      isactive: !item.isactive,
      title: convertToArrayFormat(item.title),
      files: item.files
        ? convertToArrayFormat(item.files)
        : [], // zorunluysa boş gönder
    };

    const token = Cookies.get("token");
    const res = await fetch(`/api/catalogs?id=${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Güncellenemedi");

    await fetchCatalogs();
    Swal.close();
  } catch (err) {
    console.error(err);
    Swal.fire("Hata", "Aktiflik durumu güncellenemedi.", "error");
  }
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
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <label>kayıt göster</label>
          <span className={styles.resultCount}>
            Bulunan: <b>{totalCount}</b> kayıt
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Ara:</label>
          <input
            type="text"
            placeholder="Başlık ara..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            disabled // Şimdilik arama backend'e bağlı olmadığı için devre dışı
          />
          <Link href="/catalogs/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Görsel</th>
            <th>Başlık</th>
            <th>Aktiflik</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {catalogs.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            catalogs.map((cat, i) => (
              <tr key={cat.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>
                  {cat.cover_img ? (
                    <Image
                      src={
                        cat.cover_img.startsWith("http") ? cat.cover_img : `/`
                      }
                      alt="Kapak Görseli"
                      width={70}
                      height={50}
                    />
                  ) : (
                    <span className={styles.noImage}>Yok</span>
                  )}
                </td>
                <td>{cat.title.tr}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={cat.isactive}
                      onChange={() => handleToggle(cat)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/catalogs/content-edit/${cat.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(cat.id)}
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
