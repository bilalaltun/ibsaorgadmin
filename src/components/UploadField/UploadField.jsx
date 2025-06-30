"use client";

import { useRef, useState } from "react";
import styles from "./UploadField.module.css";
import imageCompression from "browser-image-compression"; // 📌 Yeni ekleme

export default function UploadField({
  label = "Dosya Yükle",
  accept = "*/*",
  type = "file",
  value = null,
  requiredWidth = null,
  requiredHeight = null,
  onChange,
  disabled = false,
  multiple = false,
}) {
  const inputRef = useRef();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme hatası");

      return data.url;
    } catch (err) {
      console.error("Upload error:", err);
      setError("⚠ Dosya yüklenemedi.");
      return null;
    }
  };
  const handleDelete = () => {
    setPreviewUrl(null);
    onChange?.(null);
  };

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (type === "image" && (requiredWidth || requiredHeight)) {
      const imageURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageURL;

      // Görsel yüklenince boyutları kontrol et
      img.onload = async () => {
        if (
          (requiredWidth && img.width !== requiredWidth) ||
          (requiredHeight && img.height !== requiredHeight)
        ) {
          setError(
            `⚠ Görsel boyutu tam olarak ${requiredWidth}x${requiredHeight}px olmalıdır.`
          );
          return;
        }

        await processImage(file, imageURL); // ölçü uygunsa devam et
      };

      return; // yükleme burada durur, devamı img.onload içinde yapılır
    }

    // Diğer dosyalar (video vs.)
    await processImage(file);
  };
  const processImage = async (file, localUrl = null) => {
    setIsUploading(true);
    setError("");

    if (localUrl) setPreviewUrl(localUrl);
    else setPreviewUrl(URL.createObjectURL(file));

    if (type === "image") {
      try {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 6000,
          useWebWorker: true,
        });

        // 🧠 Dosya adını koru (ya da fallback)
        const originalName =
          file.name && file.name.includes(".")
            ? file.name
            : `upload.${file.type?.split("/")[1] || "jpg"}`;

        const renamedFile = new File([compressedBlob], originalName, {
          type: compressedBlob.type || file.type || "image/jpeg",
        });

        file = renamedFile;

        console.log("✅ Gerçek filename:", file.name, file.type);
      } catch (err) {
        console.error("Compress error:", err);
        setError("⚠ Görsel sıkıştırılamadı.");
        setIsUploading(false);
        return;
      }
    }

    const uploadedUrl = await uploadFile(file);
    if (uploadedUrl) {
      onChange?.(uploadedUrl);
    }
    setIsUploading(false);
  };

  const renderPreview = () => {
    const src = previewUrl || value;
    if (!src) return null;
    const deleteButton = (
      <button onClick={handleDelete} className={styles.deleteButton}>
        ❌
      </button>
    );

    if (type === "image") {
      return (
        <div className={styles.previewItem}>
          <img src={src} className={styles.previewImage} alt="Preview" />
          {deleteButton}
          <p>{src.includes("blob:") ? "Geçici Görsel" : "✔ Yüklendi"}</p>
        </div>
      );
    }

    if (type === "video") {
      return (
        <div className={styles.previewItem}>
          <video src={src} className={styles.previewVideo} controls />
          {deleteButton}
          <p>{src.includes("blob:") ? "Geçici Video" : "✔ Yüklendi"}</p>
        </div>
      );
    }

    return (
      <div className={styles.previewItem}>
        <span className={styles.fileIcon}>📄</span>
        <p>{src.split("/").pop()}</p>
        {deleteButton}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <label
        className={`${styles.uploadButton} ${
          disabled || isUploading ? styles.disabled : ""
        }`}
        onClick={() => !disabled && !isUploading && inputRef.current.click()}
      >
        {type === "image" && "🖼️"}
        {type === "video" && "🎬"}
        {type === "file" && "📁"} {isUploading ? "Yükleniyor..." : label}
        {isUploading && <span className={styles.spinnerSmall}></span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        disabled={disabled || isUploading}
        onChange={handleFileChange}
      />

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.previewContainer}>{renderPreview()}</div>
    </div>
  );
}
