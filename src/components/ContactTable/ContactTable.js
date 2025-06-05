"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function LocationTable() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchLocations() {
    try {
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error("Veri alınamadı.");
      const data = await res.json();
      setLocations(data.data);
    } catch {}
  }
  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = useMemo(() => {
    return locations.filter((item) =>
      (item.title?.tr || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, locations]);

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
      const res = await fetch(`/api/contacts?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      Swal.fire("Silindi", "Lokasyon silindi", "success");
    } catch {
      Swal.fire("Hata", "Silme başarısız", "error");
    }
  };

  const handleToggle = async (user) => {
    // `title` ve `address` alanlarını dönüştür
    const convertLangObjectToArray = (obj) =>
      Object.entries(obj || {}).map(([langCode, value]) => ({
        langCode,
        value,
      }));

    const updated = {
      id: user.id,
      gmail: user.gmail,
      isactive: !user.isactive,
      title: convertLangObjectToArray(user.title),
      address: convertLangObjectToArray(user.address),
      phones: user.phones || [],
    };

    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/contacts?id=${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error();

      await fetchLocations();
      Swal.fire("Başarılı", "Durum güncellendi.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Durum güncellenemedi.", "error");
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
            placeholder="Başlık (TR) ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/contact-details/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Başlık</th>
            <th>Adres</th>
            <th>Email</th>
            <th>Telefonlar</th>
            <th>Aktif</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.noData}>
                Kayıt yok
              </td>
            </tr>
          ) : (
            paginated.map((item, i) => (
              <tr key={item.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{item.title?.tr || "-"}</td>
                <td>{item.address?.tr || "-"}</td>
                <td>{item.gmail || "-"}</td>
                <td>
                  <ul className={styles.phoneList}>
                    {item.phones?.map((p, idx) => (
                      <li key={idx}>{p.phone_number}</li>
                    ))}
                  </ul>
                </td>
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
                  <Link href={`/contact-details/content-edit/${item.id}`}>
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
