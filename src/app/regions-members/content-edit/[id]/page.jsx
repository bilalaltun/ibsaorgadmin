"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function EditRegionMemberPage() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bölge listesi çek
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

  // Region member bilgisi çek
  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch(`/api/region-members?id=${id}`);
        if (!res.ok) throw new Error("Member not found.");
        const data = await res.json();
        setForm({
          region_id: data.region_id || "",
          name: data.name || "",
          title: data.title || "",
          email: data.email || "",
          flag_url: data.flag_url || "",
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load member data.");
      } finally {
        setLoading(false);
      }
    }

    fetchMember();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () =>
    form.region_id && form.name.trim() && form.title.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Missing Info", "Please fill in name, title and region.", "warning");
      return;
    }

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/region-members?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Server error");

      Swal.fire("Success", "Region member updated.", "success").then(() =>
        router.push("/regions-members")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred during update.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Region Member</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
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
              required
            />

            <label>Title</label>
            <input
              className={styles.input}
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
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
              UPDATE
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
