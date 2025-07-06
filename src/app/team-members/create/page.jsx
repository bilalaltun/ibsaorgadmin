"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";
import UploadField from "@/components/UploadField/UploadField";

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    position: "",
    email: "",
    photo_url: "",
    flag_url: "",
    isactive: true,
  });

  const isFormValid = () =>
    form.name.trim() &&
    form.position.trim() &&
    form.email.trim() &&
    form.photo_url.trim() &&
    form.flag_url.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "All fields are required.", "warning");
      return;
    }

    const payload = {
      name: form.name,
      position: form.position,
      email: form.email,
      photo_url: form.photo_url,
      flag_url: form.flag_url,
      isactive: form.isactive,
    };

    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/teammembers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create");

      Swal.fire("Success", "Team member successfully created.", "success").then(
        () => {
          router.push("/team-members");
        }
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while saving.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Add New Team Member</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <UploadField
            type="image"
            accept="image/*"
            value={form.photo_url}
            label="Upload Photo"
            onChange={(url) => setForm((prev) => ({ ...prev, photo_url: url }))}
          />
          <br />
          <UploadField
            type="image"
            accept="image/*"
            value={form.flag_url}
            label="Upload Flag"
            onChange={(url) => setForm((prev) => ({ ...prev, flag_url: url }))}
          />

          <label>Name</label>
          <input
            type="text"
            className={styles.input}
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <label>Position</label>
          <input
            type="text"
            className={styles.input}
            value={form.position}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, position: e.target.value }))
            }
          />

          <label>Email</label>
          <input
            type="email"
            className={styles.input}
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <button
            type="submit"
            className="submitButton"
            disabled={!isFormValid()}
          >
            CREATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
