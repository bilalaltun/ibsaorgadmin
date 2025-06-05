"use client";

import { FaEdit } from "react-icons/fa";
import styles from "./styles.module.css";

const staticModules = [
  { id: 1, name: "Anasayfa Hakkımızda", path: "/homepage/homepage-about" },
  { id: 2, name: "Anasayfa Deneyim", path: "/homepage/homepage-experience" },
  { id: 3, name: "Anasayfa Tesisler", path: "/homepage/homepage-facilities" },
  { id: 4, name: "Anasayfa Video", path: "/homepage/homepage-video" },
  { id: 5, name: "Anasayfa Başarılarımız", path: "/homepage/homepage-success" },
  { id: 6, name: "Footer", path: "/homepage/homepage-footer" },
];

export default function StaticSettingsTable() {
  const handleEdit = (path) => {
    window.location.href = path;
  };

  return (
    <div className={styles.tableWrapper}>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Modül Adı</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {staticModules.map((modul, index) => (
            <tr key={modul.id}>
              <td>{index + 1}</td>
              <td>{modul.name}</td>
              <td>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(modul.path)}
                  title="Düzenle"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
