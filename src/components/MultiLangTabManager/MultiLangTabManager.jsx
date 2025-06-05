import { useState } from "react";
import langs from "@/data/langs";
import styles from "./MultiLangTabManager.module.css";

export default function MultiLangTabManager({ tabs, setTabs }) {
  const addTab = () => {
    setTabs((prev) => [
      ...prev,
      {
        title: "",
        content: langs.reduce((acc, lang) => {
          acc[lang] = "";
          return acc;
        }, {}),
      },
    ]);
  };

  const removeTab = (index) => {
    setTabs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTab = (index, field, lang, value) => {
    setTabs((prev) => {
      const updated = [...prev];
      if (field === "title") {
        updated[index].title = value;
      } else {
        updated[index].content[lang] = value;
      }
      return updated;
    });
  };

  return (
    <div className={styles.tabWrapper}>
      <h3 className={styles.sectionTitle}>Ürün Sekmeleri</h3>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Başlık</th>
            {langs.map((lang) => (
              <th key={lang}>İçerik ({lang.toUpperCase()})</th>
            ))}
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {tabs.length === 0 ? (
            <tr>
              <td colSpan={langs.length + 2} style={{ textAlign: "center" }}>
                Kayıt yok
              </td>
            </tr>
          ) : (
            tabs.map((tab, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input
                    type="text"
                    value={tab.title}
                    onChange={(e) =>
                      updateTab(i, "title", null, e.target.value)
                    }
                    className={styles.input}
                  />
                </td>
                {langs.map((lang) => (
                  <td key={lang}>
                    <input
                    type="text"
                      value={tab.content[lang] || ""}
                      onChange={(e) =>
                        updateTab(i, "content", lang, e.target.value)
                      }
                      className={styles.input}
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    onClick={() => removeTab(i)}
                    className={styles.deleteBtn}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button type="button" onClick={addTab} className={styles.addBtn}>
        + Satır Ekle
      </button>
    </div>
  );
}
