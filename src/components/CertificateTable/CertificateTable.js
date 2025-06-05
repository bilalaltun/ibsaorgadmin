/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function CertificatesTable() {
  const [certificates, setCertificates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCertificates = async () => {
    try {
      const res = await fetch(
        `/api/certificates?pageSize=${pageSize}&currentPage=${currentPage}`
      );
      const json = await res.json();
      setCertificates(json.data || []);
      setTotalCount(json.pagination?.totalCount || 0);
      setTotalPages(json.pagination?.totalPagesCount || 1);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      Swal.fire("Hata", "Sertifikalar yüklenemedi.", "error");
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [currentPage, pageSize]);

  const filtered = useMemo(() => {
    return certificates.filter((c) =>
      c.title?.tr?.toLowerCase().includes(search.toLowerCase())
    );
  }, [certificates, search]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Silmek istiyor musun?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
    });
    const token = Cookies.get("token");

    if (!confirm.isConfirmed) return;

    await fetch(`/api/certificates?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchCertificates();
    Swal.fire("Silindi", "Sertifika silindi.", "success");
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
            placeholder="Sertifika ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled // backend destekli arama yapılmadığı için şimdilik kapalı
          />
          <Link href="/certificates/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Başlık</th>
            <th>Görsel</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {certificates.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            certificates.map((c, i) => (
              <tr key={c.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{c.title?.tr}</td>
                <td>
                  {c.img ? (
                    <img src={c.img} alt="görsel" width={70} height={50} />
                  ) : (
                    <span className={styles.noImage}>Yok</span>
                  )}
                </td>
                <td>
                  <Link href={`/certificates/content-edit/${c.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(c.id)}
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
