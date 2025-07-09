"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateReferansPage() {
  const router = useRouter();
  const imageRef = useRef();

  const [form, setForm] = useState({
    img: "",
    name: "",
    isactive: true,
    show_at_home: true,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return form.img && form.name.trim().length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    const payload = {
      img: form.img,
      name: form.name,
      isactive: form.isactive,
      show_at_home: form.show_at_home,
    };

    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/references", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Partner has been created.", "success").then(() => {
        router.push("/references");
      });
    } catch {
      Swal.fire("Error", "Creation failed.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Add New Partner</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Image</label>
          <UploadField
            ref={imageRef}
            type="image"
            accept="image/*"
            value={form.img}
            onChange={(url) => handleChange("img", url)}
            label="Upload Image"
          />

          <label>Name</label>
          <input
            type="text"
            className={styles.input}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter Partner name"
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
          >
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
