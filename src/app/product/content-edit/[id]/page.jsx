"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";
import MultiImageUploader from "@/components/MultiImageUpload/MultiImageUpload";
import dynamic from "next/dynamic";
const SimpleEditor = dynamic(() => import("@/package/App"), { ssr: false });

export default function ProductContentEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeLang, setActiveLang] = useState("tr");
  const [langs, setLangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [staticFields, setStaticFields] = useState({
    images: ["", ""],
    html: "",
  });
  const [multiLangData, setMultiLangData] = useState({});

  useEffect(() => {
    async function fetchLanguages() {
      const res = await fetch("/api/languages");
      const data = await res.json();
      const codes = data.map((l) => l.name);
      setLangs(codes);

      const initialData = {};
      codes.forEach((lang) => {
        initialData[lang] = {
          project_name: "",
          category: "",
          description: [""],
          tabs: [{ title: "", content: "" }],
        };
      });
      setMultiLangData(initialData);
    }

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (!langs.length) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        if (!res.ok) throw new Error("Veri alınamadı");
        const json = await res.json();
        const data = json.data;

        setStaticFields({ images: data.images || ["", ""] });

        const langData = {};
        langs.forEach((lang) => {
          const rawTabs = data.tabs?.[lang] || [{ title: "", content: "" }];
          langData[lang] = {
            project_name: data.project_name?.[lang] || "",
            category: data.category?.[lang] || "",
            description: [data.description?.[lang] || ""],
            tabs: rawTabs.map((tab, idx) => {
              const { content, extraHtml } = splitTabContent(tab.content || "");
              return {
                title: tab.title,
                content,
                extraHtml: extraHtml || "", // 💡 burayı ayrı olarak saklayacağız
              };
            }),
          };
        });

        setMultiLangData(langData);
      } catch (err) {
        console.error("❌ Ürün yüklenemedi:", err);
        setError("Ürün verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, langs]);

  const handleStaticChange = (fnOrArray) => {
    setStaticFields((prev) => ({
      ...prev,
      images:
        typeof fnOrArray === "function" ? fnOrArray(prev.images) : fnOrArray,
    }));
  };

  const handleLangChange = (lang, key, value) => {
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }));
  };

  const handleTabChange = (lang, index, field, value) => {
    const updated = [...multiLangData[lang].tabs];
    updated[index][field] = value;
    setMultiLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], tabs: updated },
    }));
  };

  const addTab = () => {
    langs.forEach((lang) => {
      setMultiLangData((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          tabs: [...prev[lang].tabs, { title: "", content: "" }],
        },
      }));
    });
  };

  const removeTab = (index) => {
    langs.forEach((lang) => {
      const updatedTabs = [...multiLangData[lang].tabs];
      updatedTabs.splice(index, 1);
      setMultiLangData((prev) => ({
        ...prev,
        [lang]: { ...prev[lang], tabs: updatedTabs },
      }));
    });
  };

  const current = multiLangData[activeLang] || {};
  // İçeriği ayrıştırmak için bir helper fonksiyon:
  function splitTabContent(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const extraHtmlDiv = wrapper.querySelector("[data-html='true']");
    let extraHtml = "";
    if (extraHtmlDiv) {
      extraHtml = extraHtmlDiv.innerHTML;
      extraHtmlDiv.remove(); // Ayırdık, şimdi ana içeriği temizle
    }

    const content = wrapper.innerHTML;
    return { content, extraHtml };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      category_key: "tes",
      images: staticFields.images,
      project_name: {},
      category: {},
      description: {},
      tabs: {},
    };
    langs.forEach((lang) => {
      payload.project_name[lang] = multiLangData[lang].project_name;
        payload.category[lang] = multiLangData[lang].category;
      payload.description[lang] = multiLangData[lang].description || "";
      payload.tabs[lang] = (multiLangData[lang].tabs || []).map((tab, i) => ({
        title: tab.title,
        content: `${tab.content || ""}<div data-html="true" id="dynamic-html-${i}">${tab.extraHtml || ""}</div>`,
      }));
    });

    console.log(payload)

    Swal.fire({
      title: "Kaydediliyor...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/products?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: `Ürün #${id} başarıyla güncellendi.`,
      }).then(() => router.push("/product"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Kaydetme sırasında bir hata oluştu.",
      });
    }
  };

  return (
    <Layout>
      <div className={styles.blogEditContainer}>
        <h1 className={styles.pageTitle}>🛠️ Ürün – {current.project_name}</h1>
        {loading ? (
          <div className="loadingSpinner">
            <div className="spinner" />
            <p>İçerikler yükleniyor...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            {error && <p className={styles.errorText}>{error}</p>}

            <section className={styles.section}>
              <h2>Görseller</h2>
              <MultiImageUploader
                value={staticFields.images}
                onChange={handleStaticChange}
              />
            </section>

            <section className={styles.section}>
              <div className={styles.langTabs}>
                {langs.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={activeLang === lang ? styles.active : ""}
                    onClick={() => setActiveLang(lang)}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <h2>{activeLang.toUpperCase()} İçeriği</h2>
              <label>Ürün Adı</label>
              <input
                className={styles.input}
                type="text"
                value={current.project_name || ""}
                onChange={(e) =>
                  handleLangChange(activeLang, "project_name", e.target.value)
                }
              />
              <label>Kategori</label>
              <input
                className={styles.input}
                type="text"
                value={current.category || ""}
                onChange={(e) =>
                  handleLangChange(activeLang, "category", e.target.value)
                }
              />
              <label>Açıklama</label>
              <SimpleEditor
                key={`${activeLang}-desc`}
                value={current.description}
                onChange={(val) =>
                  handleLangChange(activeLang, "description", val)
                }
              />
              <h4>Sekmeler</h4>
              {current.tabs?.map((tab, index) => (
                <div
                  key={index}
                  className={styles.section}
                  style={{ position: "relative" }}
                >
                  <label>Başlık {index + 1}</label>
                  <button
                    type="button"
                    onClick={() => removeTab(index)}
                    className={styles.deleteButton}
                    style={{ position: "absolute", right: 0, top: 0 }}
                  >
                    ❌
                  </button>
                  <input
                    className={styles.input}
                    type="text"
                    value={tab.title}
                    onChange={(e) =>
                      handleTabChange(
                        activeLang,
                        index,
                        "title",
                        e.target.value
                      )
                    }
                  />

                  <label>İçerik {index + 1}</label>
                  <SimpleEditor
                    key={`${activeLang}-${index}`}
                    value={tab.content}
                    onChange={(val) =>
                      handleTabChange(activeLang, index, "content", val)
                    }
                  />
                  <label>HTML Kod</label>
                  <textarea
                    className={styles.input}
                    rows={5}
                    value={tab.extraHtml || ""}
                    onChange={(e) =>
                      handleTabChange(
                        activeLang,
                        index,
                        "extraHtml",
                        e.target.value
                      )
                    }
                  />

                  <label>Önizleme</label>
                  <div
                    className={styles.previewBox}
                    dangerouslySetInnerHTML={{
                      __html: tab.extraHtml || "",
                    }}
                    style={{
                      padding: "1rem",
                      border: "1px solid #ccc",
                      background: "#fff",
                    }}
                  />
                </div>
              ))}
              <button type="button" className={styles.input} onClick={addTab}>
                + Yeni Sekme Ekle (Tüm Dillerde)
              </button>
            </section>

            <button type="submit" className={styles.submitButton}>
              Kaydet
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
