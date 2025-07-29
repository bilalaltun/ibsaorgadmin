"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaSortUp, FaSortDown, FaSearch, FaTimes } from "react-icons/fa";
import styles from "./BlogTable.module.css";
import Cookies from "js-cookie";

export default function BlogTable({ blogs, fetchBlogs }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const allowedCategories = Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))?.category_ids || []
    : [];

  const filtered = useMemo(() => {
    if (!Array.isArray(blogs)) return [];
    
    const query = search.toLowerCase().trim();
    
    // If no search query, just filter by allowed categories
    if (!query) {
      return allowedCategories.length === 0
        ? blogs
        : blogs.filter(blog => allowedCategories.includes(blog.category_id));
    }

    // Enhanced search across multiple fields
    return blogs.filter(blog => {
      // Check category permissions first
      if (allowedCategories.length > 0 && !allowedCategories.includes(blog.category_id)) {
        return false;
      }

      // Search in multiple fields
      const searchableFields = [
        blog.title || "",
        blog.author || "",
        blog.content || "",
        blog.details || "",
        blog.category?.name || "",
        blog.tags?.join(" ") || ""
      ];

      return searchableFields.some(field => 
        field.toLowerCase().includes(query)
      );
    });
  }, [search, blogs, allowedCategories]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    
    return [...filtered].sort((a, b) => {
      const valA = (a[sortField] || "").toLowerCase?.() || "";
      const valB = (b[sortField] || "").toLowerCase?.() || "";
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

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch(`/api/blogs?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      Swal.close();

      if (res.ok) {
        await Swal.fire("Deleted!", "The blog has been deleted.", "success");
        fetchBlogs();
      } else {
        Swal.fire("Error", result.error || "Failed to delete", "error");
      }
    } catch {
      Swal.close();
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleToggle = async (blog, field, newValue) => {
    const payload = {
      link: blog.link,
      thumbnail: blog.thumbnail,
      date: blog.date,
      author: blog.author,
      isactive: field === "isactive" ? newValue : blog.isactive,
      show_at_home: blog.show_at_home,
      title: blog.title,
      details: blog.details,
      content: blog.content,
      category_id: blog.category_id,
      tags: blog.tags || [],
    };

    try {
      Swal.fire({
        title: "Updating...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch(`/api/blogs?id=${blog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      Swal.fire("Success", "Blog status updated", "success");
      fetchBlogs();
    } catch {
      Swal.close();
      Swal.fire("Error", "Status update failed", "error");
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.toolbar}>
        <div className={styles.leftControls}>
          <label>Show</label>
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
          <label>per page</label>
          <span className={styles.resultCount}>
            Found: <b>{filtered.length}</b> records
            {search && (
              <span className={styles.searchStatus}>
                {" "}for "{search}"
              </span>
            )}
          </span>
        </div>

        <div className={styles.rightControls}>
          <label>Search:</label>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="Search title..."
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button className={styles.clearSearchBtn} onClick={clearSearch}>
                <FaTimes />
              </button>
            )}
            <button className={styles.searchBtn}>
              <FaSearch />
            </button>
          </div>
          <Link href="/blog/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("title")}>
              Title{" "}
              {sortField === "title" ? (
                sortAsc ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : null}
            </th>
            <th>Cover Image</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                {search ? (
                  <div className={styles.noResults}>
                    <p>No blogs found matching "{search}"</p>
                    <button 
                      onClick={clearSearch}
                      className={styles.clearSearchLink}
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  "No records found."
                )}
              </td>
            </tr>
          ) : (
            paginated.map((blog, i) => (
              <tr key={blog.id}>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{blog.title || "-"}</td>
                <td>
                  {blog.thumbnail ? (
                    <img
                      src={
                        blog.thumbnail.startsWith("http")
                          ? blog.thumbnail
                          : blog.thumbnail.startsWith("/")
                            ? blog.thumbnail
                            : `/${blog.thumbnail}`
                      }
                      alt="cover"
                      className={styles.thumbnail}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{blog.category?.name || blog.category_id || "-"}</td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={blog.isactive}
                      onChange={() =>
                        handleToggle(blog, "isactive", !blog.isactive)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>
                  <Link href={`/blog/content-edit/${blog.id}`}>
                    <button className={styles.editBtn}>
                      <FaPen />
                    </button>
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(blog.id)}
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
