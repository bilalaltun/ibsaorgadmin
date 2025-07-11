"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import { FaEdit } from "react-icons/fa";

export default function MembersPageList() {
  const [pages, setPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/team")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setPages(data || []);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", "Failed to load member pages.", "error");
      });
  }, []);

  const filteredPages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return pages.filter((item) => item.Page.name.toLowerCase().includes(q));
  }, [pages, searchTerm]);

  const pageSummaries = useMemo(() => {
    return filteredPages.map((item) => {
      const page = item.Page;
      return {
        name: page.name,
        memberCount: page.members?.length || 0,
        displayName: page.name
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
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
            <th>Member Count</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {pageSummaries.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                No records found.
              </td>
            </tr>
          ) : (
            pageSummaries.map((page, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{page.displayName}</td>
                <td>{page.memberCount}</td>
                <td>
                  <a href={`/members/${page.name}`} title="Edit Page">
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
