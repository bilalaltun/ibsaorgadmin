"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import UploadField from "@/components/UploadField/UploadField";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import styles from "./styles.module.css";

export default function EditTeamMemberPage() {
  const { id } = useParams();
  const router = useRouter();
  const imageRef = useRef();

  const [form, setForm] = useState({
    name: "",
    position: "",
    email: "",
    photo_url: "",
    flag_url: "",
    isactive: true,
  });

  const isFormValid = () => {
    return (
      form.name.trim() &&
      form.position.trim() &&
      form.email.trim() &&
      form.photo_url.trim() &&
      form.flag_url.trim()
    );
  };

  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch(`/api/teammembers?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch team member.");
        const data = await res.json();

        setForm({
          name: data.name || "",
          position: data.position || "",
          email: data.email || "",
          photo_url: data.photo_url || "",
          flag_url: data.flag_url || "",
          isactive: data.isactive ?? true,
        });
      } catch (err) {
        console.error("Failed to fetch team member:", err);
      }
    }

    fetchMember();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire("Warning", "All fields are required.", "warning");
      return;
    }

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/teammembers?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed.");

      Swal.fire("Success", "Team member updated successfully.", "success").then(
        () => router.push("/team-members")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An error occurred while updating.", "error");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.title}>Edit Team Member</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <UploadField
            ref={imageRef}
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
            value={form.name}
            className={styles.input}
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
            value={form.email}
            className={styles.input}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <button
            type="submit"
            className="submitButton"
            disabled={!isFormValid()}
          >
            UPDATE
          </button>
        </form>
      </div>
    </Layout>
  );
}
