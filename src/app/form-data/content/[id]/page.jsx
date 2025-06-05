// ContactFormDetailPage.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";

export default function ContactFormDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("token");
  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/forms?id=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        setRecord(json);
      } catch (err) {
        console.error(err);
        Swal.fire("Hata", "Kayıt bulunamadı.", "error");
        router.push("/form-data");
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id, router]);

  return (
    <Layout>
      <div className={styles.detailCard}>
        <div className={styles.detailRow}>
          <span className={styles.label}>👤 Ad Soyad</span>
          <span className={styles.value}>{record?.userinfo}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>📱 GSM</span>
          <span className={styles.value}>{record?.gsm}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>📧 E-Posta</span>
          <span className={styles.value}>{record?.mail}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>📝 Not</span>
          <span className={styles.value}>{record?.content}</span>
        </div>
      </div>
    </Layout>
  );
}
