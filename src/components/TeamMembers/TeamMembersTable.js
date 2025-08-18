"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function TeamMemberTable() {
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/teammembers?pageSize=${pageSize}&currentPage=${currentPage}`
      );
      if (!res.ok) throw new Error("Failed to fetch members.");
      const result = await res.json();
      setMembers(result?.data || []);
      setTotalPages(result?.pagination?.totalPages || 1);
      setTotalCount(result?.pagination?.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire("Error", "Failed to load team members.", "error");
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch(`/api/teammembers?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");
      await fetchMembers();
      Swal.fire("Deleted", "Team member deleted successfully.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete member.", "error");
    }
  };

  const handleToggle = async (item) => {
    try {
      Swal.fire({
        title: "Updating...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        name: item.name,
        position: item.position,
        email: item.email,
        photo_url: item.photo_url,
        flag_url: item.flag_url,
        isactive: !item.isactive,
      };

      const token = Cookies.get("token");
      const res = await fetch(`/api/teammembers?id=${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      await fetchMembers();
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update active status.", "error");
    }
  };

  return (
    <div className={styles.wrapper}>
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
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <label>entries per page</label>
          <span className={styles.resultCount}>
            Total: <b>{totalCount}</b> records
          </span>
        </div>

        <div className={styles.rightControls}>
          <Link href="/team-members/create">
            <button className={styles.btnAdd}>ADD NEW</button>
          </Link>
        </div>
      </div>
      <div className="table-max">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Position</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No records found.
                </td>
              </tr>
            ) : (
              members.map((member, i) => (
                <tr key={member.id}>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt="Member"
                        className={styles.image}
                      />
                    ) : (
                      <span className={styles.noImage}>N/A</span>
                    )}
                  </td>
                  <td>{member.name || "-"}</td>
                  <td>{member.position || "-"}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={member.isactive}
                        onChange={() => handleToggle(member)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <Link href={`/team-members/content-edit/${member.id}`}>
                      <button className={styles.editBtn}>
                        <FaPen />
                      </button>
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(member.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
