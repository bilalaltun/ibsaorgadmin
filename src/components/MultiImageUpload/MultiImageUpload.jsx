"use client";

import { useState } from "react";
import styles from "./multiImageUploader.module.css";
import imageCompression from "browser-image-compression"; // 📌 Yeni ekleme

export default function MultiImageUploader({ value = [], onChange }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);

const handleFiles = async (event) => {
  const originalFiles = Array.from(event.target.files);
  if (!originalFiles.length) return;

  setUploadingIndex(0);

  try {
    const compressedFiles = await Promise.all(
      originalFiles.map(async (file) => {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        // Blob'u orijinal dosya adı ve tipi ile yeni bir File nesnesine dönüştür
        return new File([compressedBlob], file.name, { type: file.type });
      })
    );

    const formData = new FormData();
    compressedFiles.forEach((file) => formData.append("file", file));

    const res = await fetch("/api/multi-upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Yükleme başarısız");

    const data = await res.json();
    const newUrls = data.urls || [];

    onChange((prevImages) => [
      ...(Array.isArray(prevImages) ? prevImages : []),
      ...newUrls,
    ]);
  } catch (err) {
    console.error("Yükleme hatası:", err);
    alert("Bazı dosyalar yüklenemedi.");
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
