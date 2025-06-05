"use client";

import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function SliderRow({ slider, index, onDelete }) {
  const handleDelete = () => {
    const confirm = window.confirm(
      `"${slider.title}" başlıklı slider silinsin mi?`
    );
    if (confirm && typeof onDelete === "function") {
      onDelete(slider.id);
    }
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{slider.title}</td>

      <td>{slider.date}</td>

      <td>
        <label className="switch">
          <input type="checkbox" defaultChecked={slider.status === "active"} />
          <span className="slider round" />
        </label>
      </td>

      <td style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <Link
          href={`/slider/content-edit/${slider.id}`}
          className="edit-btn"
          title="Tüm dillerde düzenle"
        >
          <FaEdit />
        </Link>

        <button className="delete-btn" title="Sil" onClick={handleDelete}>
          <FaTrash />
        </button>
      </td>
    </tr>
  );
}
