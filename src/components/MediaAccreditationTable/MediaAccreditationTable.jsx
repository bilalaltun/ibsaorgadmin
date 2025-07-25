import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import styles from "../TeamMembers/styles.module.css";
import Cookies from "js-cookie";

export default function MediaAccreditationTable() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchItems = async () => {
    try {
      const res = await fetch(
        `/api/media-accreditation?pageSize=${pageSize}&currentPage=${currentPage}`
      );
      if (!res.ok) throw new Error("Failed to fetch records.");
      const result = await res.json();
      setItems(result || []);
      setTotalPages(result?.pagination?.totalPages || 1);
      setTotalCount(result?.pagination?.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire("Error", "Failed to load records.", "error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, pageSize]);

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
      const res = await fetch(`/api/media-accreditation?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchItems();
      Swal.fire("Deleted", "Record deleted successfully.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete record.", "error");
    }
  };

  const handleRowClick = (id) => {
    window.location.href = `/media-accreditation/${id}`;
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
      </div>
      <div className="table-max">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Company</th>
              <th>City</th>
              <th>Country</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "1rem" }}>
                  No records found.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(item.id)}>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>{item.title || "-"}</td>
                  <td>{item.firstName || "-"}</td>
                  <td>{item.lastName || "-"}</td>
                  <td>{item.company || "-"}</td>
                  <td>{item.city || "-"}</td>
                  <td>{item.country || "-"}</td>
                  <td>{item.email || "-"}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
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
