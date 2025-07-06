"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function EditCountryPage() {
  const { id } = useParams();
  const router = useRouter();
  const imageRef = useRef();
  const [regions, setRegions] = useState([]);

  const [form, setForm] = useState({
    region_id: "",
    name: "",
    federation_name: "",
    directory: "",
    address: "",
    phone: "",
    email: "",
    flag_url: "",
    isactive: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bölgeleri getir
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

  // Ülke detayını getir
  useEffect(() => {
    async function fetchCountry() {
      try {
        const res = await fetch(`/api/countries?id=${id}`);
        if (!res.ok) throw new Error("Country not found.");
        const data = await res.json();

        setForm({
          region_id: data.region_id || "",
          name: data.name || "",
          federation_name: data.federation_name || "",
          directory: data.directory || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          flag_url: data.flag_url || "",
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load country data.");
      } finally {
        setLoading(false);
      }
    }

    fetchCountry();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () =>
    form.region_id &&
    form.name.trim() &&
    form.federation_name.trim() &&
    form.directory.trim() &&
    form.address.trim() &&
    form.phone.trim() &&
    form.email.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire(
        "Missing Info",
        "Please fill in all required fields.",
        "warning"
      );
      return;
    }

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/countries?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Server error");

      Swal.fire("Success", "Country updated successfully.", "success").then(
        () => router.push("/countries")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred during update.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Country</h2>

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
              onChange={(e) =>
                handleChange("region_id", Number(e.target.value))
              }
            >
              <option value="">Select region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <label>Country Name</label>
            <input
              className={styles.input}
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <label>Federation Name</label>
            <input
              className={styles.input}
              type="text"
              value={form.federation_name}
              onChange={(e) => handleChange("federation_name", e.target.value)}
            />

            <label>Directory</label>
            <input
              className={styles.input}
              type="text"
              value={form.directory}
              onChange={(e) => handleChange("directory", e.target.value)}
            />

            <label>Address</label>
            <input
              className={styles.input}
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />

            <label>Phone</label>
            <input
              className={styles.input}
              type="text"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
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
