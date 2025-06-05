"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import styles from "./ProductTable.module.css";
import Cookies from "js-cookie";

export default function ProductTable({ products, fetchProducts }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("project_name");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!Array.isArray(products)) return [];
    return products.filter((p) => {
      const title = p?.project_name?.tr || "";
      return title.toLowerCase().includes(query);
    });
  }, [products, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortField]?.tr?.toLowerCase?.() || a[sortField] || "";
      const valB = b[sortField]?.tr?.toLowerCase?.() || b[sortField] || "";
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

const handleToggle = async (product) => {
  const langs = Object.keys(product.project_name || {});

  const updated = {
    category_key: product.category_key,
    is_active: !product.is_active,
    images: product.images || [],
    project_name: {},
    category: {},
    description: {},
    tabs: {},
  };

  langs.forEach((lang) => {
    updated.project_name[lang] = product.project_name?.[lang] || "";
    updated.category[lang] = product.category?.[lang] || "";
    updated.description[lang] = product.description?.[lang] || "";

    const tab = product.tabs?.[lang];
    if (tab) {
      updated.tabs[lang] = tab.map((t) => ({
        title: t?.title || "",
        content: t?.content || "",
      }));
    } else {
      updated.tabs[lang] = [];
    }
  });

  try {
    const token = Cookies.get("token");
    const res = await fetch(`/api/products?id=${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error("PUT başarısız");
    fetchProducts();
    Swal.fire("Başarılı", "Durum güncellendi.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Hata", "Durum güncellenemedi.", "error");
  }
};


  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `\"${name}\" ürününü silmek istiyor musunuz?`,
      text: "Bu işlem geri alınamaz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Siliniyor...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = Cookies.get("token");
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.close();

      if (res.ok) {
        await Swal.fire("Silindi!", "Ürün başarıyla silindi.", "success");
        fetchProducts();
      } else {
        Swal.fire("Hata", "Silme işlemi başarısız", "error");
      }
    } catch {
      Swal.close();
      Swal.fire("Hata", "Bir hata oluştu", "error");
    }
  };

  const totalPages = Math.ceil(filtered.length / pageSize);

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
          <Link href="/product/create">
            <button className={styles.btnAdd}>YENİ EKLE</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("project_name")}>
              Başlık {sortField === "project_name" && (sortAsc ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th onClick={() => handleSort("category")}>
              Kategori {sortField === "category" && (sortAsc ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            paginated.map((product, i) => (
              <tr key={product.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{product.project_name?.tr || "-"}</td>
                <td>{product.category?.tr || "-"}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={product.is_active}
                      onChange={() => handleToggle(product)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/product/content-edit/${product.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(product.id, product.project_name?.tr)}
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
