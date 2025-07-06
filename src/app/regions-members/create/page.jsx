"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function CreateRegionMemberPage() {
  const router = useRouter();
  const imageRef = useRef();
  const [regions, setRegions] = useState([]);

  const [form, setForm] = useState({
    region_id: "",
    name: "",
    title: "",
    email: "",
    flag_url: "",
    isactive: true,
  });

  useEffect(() => {
    async function fetchRegions() {
      try {
        const res = await fetch("/api/regions");
        const json = await res.json();
        setRegions(json.data || []);
      } catch (err) {
        console.error("Failed to fetch regions", err);
      }
    }

    fetchRegions();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () =>
    form.region_id && form.name.trim() && form.title.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Missing Info", "Please fill in region, name and title.", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = Cookies.get("token");
      const res = await fetch("/api/region-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      Swal.fire("Success", "Region member created successfully.", "success").then(() =>
        router.push("/regions-members")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while saving.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Create Region Member</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Region</label>
          <select
            className={styles.input}
            value={form.region_id}
            onChange={(e) => handleChange("region_id", Number(e.target.value))}
          >
            <option value="">Select region</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <label>Name</label>
          <input
            className={styles.input}
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <label>Title</label>
          <input
            className={styles.input}
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <label>Email</label>
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <label>Flag Image</label>
          <UploadField
            ref={imageRef}
            type="image"
            accept="image/*"
            value={form.flag_url}
            label="Upload Flag"
            onChange={(url) => handleChange("flag_url", url)}
          />

          <button type="submit" className="submitButton">
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
