// pages/homepage/EditFacilitiesPage.jsx

"use client";

import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./EditFacilitiesPage.module.css";

export default function EditFacilitiesPage() {
    const imageRefs = useRef({});

    const [languages, setLanguages] = useState([]);
    const [activeLang, setActiveLang] = useState("tr");
    const [facilityData, setFacilityData] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/homepage/facilities");
                const data = await res.json();
                const langs = Object.keys(data.facilities);
                setLanguages(langs);
                setActiveLang(langs[0]);
                setFacilityData(data.facilities);
            } catch (err) {
                console.error("Veri alınamadı", err);
            }
        }
        fetchData();
    }, []);

    const handleChange = (lang, field, value) => {
        setFacilityData((prev) => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [field]: value,
            },
        }));
    };

    const handleItemChange = (lang, index, field, value) => {
        const items = [...(facilityData[lang].items || [])];
        items[index][field] = value;
        handleChange(lang, "items", items);
    };

    const addItem = (lang) => {
        const items = [...(facilityData[lang].items || [])];
        items.push({ title: "", description: "" });
        handleChange(lang, "items", items);
    };

    const removeItem = (lang, index) => {
        const items = [...(facilityData[lang].items || [])];
        items.splice(index, 1);
        handleChange(lang, "items", items);
    };

const handleSubmit = async () => {
  const token = Cookies.get("token");

  try {
    Swal.fire({
      title: "Kaydediliyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const payload = {
      translations: Object.entries(facilityData).map(([lang, data]) => ({
        langCode: lang,
        title: data.title,
        subtitle: data.subtitle,
        button: data.button,
        button_link: data.button_link,
        image: data.image,
        items: Array.isArray(data.items)
          ? data.items.map((item) => ({
              title: item.title,
              description: item.description,
            }))
          : [],
      })),
    };

    const res = await fetch("/api/homepage/facilities", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Hata oluştu");

    Swal.fire({ icon: "success", title: "Başarılı", text: "Veriler güncellendi." });
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Hata", text: "Bir hata oluştu." });
  }
};


    const current = facilityData[activeLang] || { items: [] };

    return (
        <Layout>
            <div className={styles.container}>
                <h2 className={styles.title}>Tesis Bilgileri</h2>

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
                    <label>Başlık</label>
                    <input
                        type="text"
                        value={current.title || ""}
                        onChange={(e) => handleChange(activeLang, "title", e.target.value)}
                    />

                    <label>Alt Başlık</label>
                    <textarea
                        rows={3}
                        value={current.subtitle || ""}
                        onChange={(e) => handleChange(activeLang, "subtitle", e.target.value)}
                    />

                    <label>Buton Metni</label>
                    <input
                        type="text"
                        value={current.button || ""}
                        onChange={(e) => handleChange(activeLang, "button", e.target.value)}
                    />

                    <label>Buton Linki</label>
                    <input
                        type="text"
                        value={current.button_link || ""}
                        onChange={(e) => handleChange(activeLang, "button_link", e.target.value)}
                    />

                    <label>Görsel</label>
                    <UploadField
                        type="image"
                        ref={(el) => (imageRefs.current[activeLang] = el)}
                        accept="image/*"
                        label="Görsel Yükle"
                        value={current.image || ""}
                        onChange={(url) => handleChange(activeLang, "image", url)}
                    />
                </div>

                <h3>Tesisler</h3>
                {current.items.map((item, index) => (
                    <div key={index} className={styles.itemGroup}>
                        <h4>Tesis {index + 1}</h4>
                        <label>Başlık</label>
                        <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleItemChange(activeLang, index, "title", e.target.value)}
                        />
                        <label>Açıklama</label>
                        <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) => handleItemChange(activeLang, index, "description", e.target.value)}
                        />
                        <button type="button" className={styles.removeButton} onClick={() => removeItem(activeLang, index)}>
                            Tesis Sil
                        </button>
                    </div>
                ))}

                <button type="button" className={styles.addButton} onClick={() => addItem(activeLang)}>
                    Tesis Ekle
                </button>

                <button className={styles.submitButton} onClick={handleSubmit}>
                    KAYDET
                </button>
            </div>
        </Layout>
    );
}
