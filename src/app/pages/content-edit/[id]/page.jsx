"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Layout from "@/components/Layout";
import styles from "./styles.module.css";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/package/App"), { ssr: false });

export default function EditPageContent() {
  const { id } = useParams();
  const router = useRouter();

  const [langs, setLangs] = useState([]);
  const [menus, setMenus] = useState([]);
  const [submenus, setSubmenus] = useState([]);
  const [activeLang, setActiveLang] = useState("tr");
  const [form, setForm] = useState({
    link: "",
    isactive: true,
    menu_id: 0,
    submenu_id: 0,
    titles: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      const res = await fetch("/api/languages");
      const data = await res.json();
      setLangs(data);
      if (data.length > 0) setActiveLang(data[0].name);
    };

    const fetchMenus = async () => {
      const res = await fetch("/api/menus");
      const data = await res.json();
      setMenus(data.data);
    };

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/pages?id=${id}`);
        const json = await res.json();
        const item = json.data;

        const titlesMap = {};
        item.titles.forEach((t) => {
          titlesMap[t.lang_code] = {
            meta_title: t.meta_title,
            page_title: t.page_title,
            meta_keywords: t.meta_keywords,
            meta_description: t.meta_description,
            content: t.content,
          };
        });

        setForm({
          link: item.link,
          isactive: item.isactive,
          menu_id: item.menu_id,
          submenu_id: item.submenu_id || 0,
          titles: titlesMap,
        });
      } catch {
        Swal.fire("Hata", "Veri alınamadı.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
    fetchMenus();
    fetchData();
  }, [id]);

  useEffect(() => {
    const selectedMenu = menus.find((m) => m.id === form.menu_id);
    setSubmenus(selectedMenu?.submenus || []);
  }, [form.menu_id, menus]);

  const handleLangChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      titles: {
        ...prev.titles,
        [activeLang]: {
          ...prev.titles[activeLang],
          [field]: value,
        },
      },
    }));
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return (
      form.link.trim() &&
      langs.every((lang) => {
        const t = form.titles[lang.name];
        return (
          t &&
          t.meta_title &&
          t.page_title &&
          t.meta_keywords &&
          t.meta_description &&
          t.content
        );
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      Swal.fire("Uyarı", "Tüm alanları doldurun.", "warning");
      return;
    }

    Swal.fire({ title: "Güncelleniyor...", didOpen: () => Swal.showLoading() });

    try {
      const token = Cookies.get("token");
      const payload = {
        link: form.link,
        isactive: form.isactive,
        menu_id: form.menu_id,
        submenu_id: form.submenu_id,
        titles: langs.map((lang) => ({
          lang_code: lang.name,
          ...form.titles[lang.name],
        })),
      };

      const res = await fetch(`/api/pages?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Başarılı", "Sayfa güncellendi.", "success").then(() => {
        router.push("/pages");
      });
    } catch {
      Swal.fire("Hata", "Güncelleme başarısız.", "error");
    }
  };

  return (
    <Layout>
      <h1 className={styles.pageTitle}>📄 Sayfa Güncelle</h1>
      <div className={styles.section}>
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <label>Bağlantı</label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => handleChange("link", e.target.value)}
            className={styles.input}
          />

          <label>Menü</label>
          <select
            value={form.menu_id}
            onChange={(e) => handleChange("menu_id", Number(e.target.value))}
          >
            <option value={0}>Seçiniz</option>
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.titles.tr || `Menü ${menu.id}`}
              </option>
            ))}
          </select>
          {/* 
          <label>Alt Menü</label>
          <select
            value={form.submenu_id}
            onChange={(e) => handleChange("submenu_id", Number(e.target.value))}
          >
            <option value={0}>Yok</option>
            {submenus.map((submenu) => (
              <option key={submenu.id} value={submenu.id}>
                {submenu.titles.tr || `Alt Menü ${submenu.id}`}
              </option>
            ))}
          </select> */}

          <div className={styles.tabsContainer}>
            <div className={styles.langTabs}>
              {langs.map((lang) => (
                <button
                  key={lang.name}
                  type="button"
                  className={
                    activeLang === lang.name ? styles.active : styles.tab
                  }
                  onClick={() => setActiveLang(lang.name)}
                >
                  {lang.name.toUpperCase()}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              <label>Meta Başlık</label>
              <input
                type="text"
                value={form.titles[activeLang]?.meta_title || ""}
                onChange={(e) => handleLangChange("meta_title", e.target.value)}
              />

              <label>Sayfa Başlığı</label>
              <input
                type="text"
                value={form.titles[activeLang]?.page_title || ""}
                onChange={(e) => handleLangChange("page_title", e.target.value)}
              />

              <label>Anahtar Kelimeler</label>
              <input
                type="text"
                value={form.titles[activeLang]?.meta_keywords || ""}
                onChange={(e) =>
                  handleLangChange("meta_keywords", e.target.value)
                }
              />

              <label>Açıklama</label>
              <textarea
                value={form.titles[activeLang]?.meta_description || ""}
                onChange={(e) =>
                  handleLangChange("meta_description", e.target.value)
                }
              />

              <label>İçerik</label>
              <Editor
                key={activeLang}
                value={form.titles[activeLang]?.content || ""}
                onChange={(value) => handleLangChange("content", value)}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            GÜNCELLE
          </button>
        </form>
      </div>
    </Layout>
  );
}
