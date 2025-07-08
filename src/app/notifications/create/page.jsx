"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import styles from "./styles.module.css";
import { db } from "../../../lib/db";

export default function CreateNotificationPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    notificationTitle: "",
    notificationMessage: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.notificationTitle.trim() || !form.notificationMessage.trim()) {
      Swal.fire("Warning", "Please fill in both title and message.", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await addDoc(collection(db, "notification"), {
        notificationTitle: form.notificationTitle.trim(),
        notificationMessage: form.notificationMessage.trim(),
        notificationDate: Timestamp.now(),
      });

      Swal.fire("Success", "Notification created.", "success").then(() =>
        router.push("/notifications")
      );
    } catch (error) {
      console.error("Error adding notification:", error);
      Swal.fire("Error", "An error occurred while saving.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create New Notification</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Notification Title</label>
          <input
            className={styles.input}
            type="text"
            value={form.notificationTitle}
            onChange={(e) => handleChange("notificationTitle", e.target.value)}
          />

          <label>Notification Message</label>
          <textarea
            className={styles.textarea}
            rows={5}
            value={form.notificationMessage}
            onChange={(e) =>
              handleChange("notificationMessage", e.target.value)
            }
          />

          <button type="submit" className="submitButton">
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
