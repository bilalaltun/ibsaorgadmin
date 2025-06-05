/* eslint-disable */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./SliderTable.module.css";
import langs from "@/data/langs";
import Image from "next/image";
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
        if (!res.ok) throw new Error("Veri alınamadı");
        const data = await res.json();
        setSliders(data.data);
      } catch {
        setError("Slider verileri alınamadı.");
      }
    }
    fetchSliders();
  }, []);

  const convertToArrayFormat = (obj) =>
    Object.entries(obj || {}).map(([langCode, value]) => ({
      langCode,
      value,
    }));

  const filtered = useMemo(() => {
    return sliders?.length > 0
      ? sliders.filter((s) => {
          const title = s.titles?.[langs[0]] || "";
          return title.toLowerCase().includes(search.toLowerCase());
        })
      : [];
  }, [search, sliders]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a.titles?.[langs[0]]?.toLowerCase?.() || "";
      const valB = b.titles?.[langs[0]]?.toLowerCase?.() || "";
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
      title: "Bu slider silinsin mi?",
      text: "Bu işlem geri alınamaz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
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
      if (!res.ok) throw new Error("Silme başarısız");
      setSliders((prev) => prev.filter((s) => s.id !== id));
      Swal.fire("Silindi!", "Slider başarıyla silindi.", "success");
    } catch {
      Swal.fire("Hata", "Silme işlemi sırasında sorun oluştu.", "error");
    }
  };

  if (error) return <p className="error">{error}</p>;

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
          <Link href="/slider/sort">
            <button className={styles.btnAdd}>SIRALA</button>
          </Link>

          <Link href="/slider/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("titles")}>
              Başlık{" "}
              {sortField === "titles" ? (
                sortAsc ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : null}
            </th>
            <th>Fotograf</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                Kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            paginated.map((slider, i) => (
              <tr key={slider.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{slider.titles?.[langs[0]] || "-"}</td>
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
                      onChange={async () => {
                        const updated = {
                          ...slider,
                          isactive: !slider.isactive,
                        };

                        Swal.fire({
                          title: "Durum güncelleniyor...",
                          allowOutsideClick: false,
                          didOpen: () => Swal.showLoading(),
                        });

                        try {
                          const token = Cookies.get("token");
                          const res = await fetch(
                            `/api/sliders?id=${slider.id}`,
                            {
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
                                dynamic_link_alternative:
                                  updated.dynamic_link_alternative,
                                order: updated.order,
                                isactive: updated.isactive,
                                titles: convertToArrayFormat(updated.titles),
                                description: convertToArrayFormat(
                                  updated.descriptions
                                ),
                                content: convertToArrayFormat(updated.contents),
                              }),
                            }
                          );

                          if (!res.ok) throw new Error("Durum güncellenemedi");

                          setSliders((prev) =>
                            prev.map((s) =>
                              s.id === slider.id
                                ? { ...s, isactive: updated.isactive }
                                : s
                            )
                          );
                          Swal.close();
                        } catch (err) {
                          console.error(err);
                          Swal.fire("Hata", "Durum güncellenemedi", "error");
                        }
                      }}
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
