"use client";

import { useState } from "react";
import styles from "./multiImageUploader.module.css";
import imageCompression from "browser-image-compression"; // 📌 Yeni ekleme

export default function MultiImageUploader({ value = [], onChange }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
      setUploadingIndex(i);

      let file = files[i];

      try {
        // 🔻 Görsel sıkıştır
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
        file = compressed;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Yükleme başarısız");

        const { url } = await res.json();
        onChange((prevImages) => {
          return Array.isArray(prevImages) ? [...prevImages, url] : [url];
        });
      } catch (err) {
        console.error("Yükleme hatası:", err);
        alert(`"${files[i].name}" yüklenemedi.`);
      }
    }

    setUploadingIndex(null);
  };

  const removeImage = (index) => {
    const updated = Array.isArray(value) ? [...value] : [];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className={styles.uploader}>
      <label className={styles.uploadLabel}>
        🖼️
        {uploadingIndex !== null
          ? `Yükleniyor... (${uploadingIndex + 1})`
          : "Görsel Ekle"}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
          disabled={uploadingIndex !== null}
          hidden
        />
      </label>

      <div className={styles.previewGrid}>
        {(Array.isArray(value) ? value : []).map((url, i) => (
          <div key={i} className={styles.previewItem}>
            <img src={url} alt={`uploaded-${i}`} />
            <button type="button" onClick={() => removeImage(i)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
