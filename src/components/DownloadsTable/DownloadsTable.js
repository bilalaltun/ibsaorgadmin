"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import { FaEdit } from "react-icons/fa";

export default function DownloadsPageList() {
  const [pages, setPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/downloadfile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setPages(data.Pages || []);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", "Failed to load file list.", "error");
      });
  }, []);

  const filteredPages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return pages.filter((page) => page.name.toLowerCase().includes(q));
  }, [pages, searchTerm]);

  const pageSummaries = useMemo(() => {
    return filteredPages.map((page) => {
      const categoryCount = page.CategoryTab.length;
      const fileCount = page.CategoryTab.reduce(
        (acc, tab) => acc + tab.Files.length,
        0
      );
      return {
        name: page.name,
        displayName: page.name
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        categoryCount,
        fileCount,
      };
    });
  }, [filteredPages]);

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.searchBar}>
        <label htmlFor="search">Search by Page Name:</label>
        <input
          type="text"
          id="search"
          placeholder="Enter page name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Page Name</th>
            <th>Category Count</th>
            <th>File Count</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {pageSummaries.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                No records found.
              </td>
            </tr>
          ) : (
            pageSummaries.map((page, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{page.displayName}</td>
                <td>{page.categoryCount}</td>
                <td>{page.fileCount}</td>
                <td>
                  <a href={`/downloads/${page.name}`} title="Edit Page">
                    <FaEdit />
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
