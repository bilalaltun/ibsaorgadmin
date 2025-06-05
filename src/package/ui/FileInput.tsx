import type { JSX } from "react";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import "./Input.css";

type Props = Readonly<{
  "data-test-id"?: string;
  accept?: string;
  label: string;
  type?: "image" | "video"; // varsayılan = image
  requiredWidth?: number;
  requiredHeight?: number;
  onChange: (url: string | null) => void;
}>;

export default function FileInput({
  accept = "image/*",
  label,
  type = "image",
  requiredWidth,
  requiredHeight,
  onChange,
  "data-test-id": dataTestId,
}: Props): JSX.Element {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const dosyaYukle = async (file: File): Promise<string | null> => {
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
      console.error("Yükleme hatası:", err);
      setError("⚠ Dosya yüklenemedi.");
      return null;
    }
  };

  const resmiIsle = async (file: File, localUrl: string | null = null) => {
    setIsUploading(true);
    setError("");

    setPreviewUrl(localUrl || URL.createObjectURL(file));

    if (type === "image") {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const newFile = new File([compressed], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });

        file = newFile;
      } catch (err) {
        console.error("Sıkıştırma hatası:", err);
        setError("⚠ Görsel sıkıştırılamadı.");
        setIsUploading(false);
        return;
      }
    }

    const yuklenenUrl = await dosyaYukle(file);
    if (yuklenenUrl) {
      onChange?.(yuklenenUrl);
    }

    setIsUploading(false);
  };

  const dosyaDegisti = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image" && (requiredWidth || requiredHeight)) {
      const imageURL: string | null = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageURL;

      img.onload = async () => {
        if (
          (requiredWidth && img.width !== requiredWidth) ||
          (requiredHeight && img.height !== requiredHeight)
        ) {
          setError(
            `⚠ Görselin boyutu tam olarak ${requiredWidth}x${requiredHeight}px olmalı.`
          );
          return;
        }
        await resmiIsle(file, imageURL);
      };
    } else {
      await resmiIsle(file);
    }
  };

  const kaldir = () => {
    setPreviewUrl(null);
    onChange?.(null);
  };

  return (
    <div className="Input__wrapper">
      <label className="Input__label">{label}</label>

      <input
        type="file"
        accept={accept}
        className="Input__input"
        onChange={dosyaDegisti}
        data-test-id={dataTestId}
      />

      {isUploading && <p>⏳ Yükleniyor...</p>}

      {previewUrl && (
        <div className="Input__preview">
          {type === "image" ? (
            <img src={previewUrl} alt="Önizleme" height="100" />
          ) : (
            <video src={previewUrl} controls height="100" />
          )}
          <button className="Input__delete-btn" onClick={kaldir}>
            🗑 Kaldır
          </button>
        </div>
      )}

      {error && <p className="Input__error">{error}</p>}
    </div>
  );
}
