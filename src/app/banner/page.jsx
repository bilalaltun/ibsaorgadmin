"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./EditAboutSectionPage.module.css";
import UploadField from "@/components/UploadField/UploadField";

export default function EditAboutSectionPage() {
  const [image, setImage] = useState("");

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await fetch("/api/banner");
        if (!res.ok) throw new Error("Veri alınamadı.");
        const data = await res.json();
        setImage(data?.bannerImage);
      } catch (err) {
        console.error("GET Hatası:", err);
      }
    }
    fetchAbout();
  }, []);

  const handleSave = async () => {
    const token = Cookies.get("token");
    Swal.fire({
      title: "Güncelleniyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch("/api/banner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bannerImage: image }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız oldu.");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Veriler güncellendi.",
      });
    } catch (err) {
      console.error("PUT Hatası:", err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Veri kaydı sırasında sorun oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Banner</h2>
        <div className={styles.section}>
          <UploadField
            type="image"
            accept="image/*"
            label="Görsel Yükle"
            value={image}
            onChange={(url) => setImage(url)}
          />
        </div>
        <button onClick={handleSave} className="submitButton">
          KAYDET
        </button>
      </div>
    </Layout>
  );
}
