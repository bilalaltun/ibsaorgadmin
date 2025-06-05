"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./EditFooterPage.module.css";
import imageCompression from "browser-image-compression";

export default function EditFooterPage() {
    const [languages, setLanguages] = useState([]);
    const [activeLang, setActiveLang] = useState("tr");
    const [footerData, setFooterData] = useState({});
    const [gallery, setGallery] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/homepage/footer");
                const data = await res.json();
                const langs = Object.keys(data.footer);
                setLanguages(langs);
                setActiveLang(langs[0]);
                setFooterData(data.footer);
                setGallery(data.gallery || []);
            } catch (err) {
                console.error("Footer verisi alınamadı", err);
            }
        }
        fetchData();
    }, []);

    const handleChange = (lang, field, value) => {
        setFooterData((prev) => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [field]: value,
            },
        }));
    };


    const [uploadingIndex, setUploadingIndex] = useState(null);

    const handleFiles = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        const total = gallery.length + files.length;
        if (total > 6) {
            Swal.fire({
                icon: "warning",
                title: "Sınır Aşıldı",
                text: "En fazla 6 görsel yükleyebilirsiniz.",
            });
            return;
        }

        for (let i = 0; i < files.length; i++) {
            setUploadingIndex(i);

            let file = files[i];

            try {
                const compressed = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                });

                const formData = new FormData();
                formData.append("file", compressed);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("Yükleme başarısız");

                const { url } = await res.json();
                setGallery((prev) => [...prev, url]);
            } catch (err) {
                console.error("Yükleme hatası:", err);
                alert(`"${files[i].name}" yüklenemedi.`);
            }
        }

        setUploadingIndex(null);
    };

    const handleSubmit = async () => {
        if (gallery.length !== 6) {
            Swal.fire({
                icon: "warning",
                title: "Eksik Görsel",
                text: "Lütfen tam 6 görsel seçin.",
            });
            return;
        }

        const token = Cookies.get("token");
        try {
            Swal.fire({
                title: "Kaydediliyor...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const translations = Object.entries(footerData).map(([langCode, data]) => ({
                langCode,
                ...data,
            }));

            const payload = {
                translations,
                gallery,
            };

            const res = await fetch("/api/homepage/footer", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Hata oluştu");

            Swal.fire({ icon: "success", title: "Başarılı", text: "Footer güncellendi." });
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Hata", text: "Bir hata oluştu." });
        }
    };

    const current = footerData[activeLang] || {};

    return (
        <Layout>
            <div className={styles.container}>
                <h2 className={styles.title}>Footer Alanı</h2>

                <div className={styles.langTabs}>
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            className={activeLang === lang ? styles.active : ""}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className={styles.section}>
                    <label>İletişim Başlığı</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={current.contactTitle || ""}
                        onChange={(e) => handleChange(activeLang, "contactTitle", e.target.value)}
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        className={styles.input}
                        value={current.email || ""}
                        onChange={(e) => handleChange(activeLang, "email", e.target.value)}
                    />

                    <label>Slogan</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={current.logo_slogan || ""}
                        onChange={(e) => handleChange(activeLang, "logo_slogan", e.target.value)}
                    />

                    <label>Adres Başlığı</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={current.address_title || ""}
                        onChange={(e) => handleChange(activeLang, "address_title", e.target.value)}
                    />

                    <label>Adres Harita Linki</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={current.address_link || ""}
                        onChange={(e) => handleChange(activeLang, "address_link", e.target.value)}
                    />

                    <label>Telefon</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={current.phone || ""}
                        onChange={(e) => handleChange(activeLang, "phone", e.target.value)}
                    />
                </div>

                <h3>Galeri (6 görsel zorunlu)</h3>

                <div className={styles.gallery}>
                    {gallery.map((src, i) => (
                        <div key={i} className={styles.galleryItem}>
                            <img src={src} alt={`footer-img-${i}`} />
                            <button
                                type="button"
                                onClick={() => {
                                    setGallery((prev) => prev.filter((_, index) => index !== i));
                                }}
                                className={styles.removeButton}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>


                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    disabled={uploadingIndex !== null}
                    className={styles.uploadInput}
                />


                <button className={styles.submitButton} onClick={handleSubmit}>
                    KAYDET
                </button>
            </div>
        </Layout>
    );
}
