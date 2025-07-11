"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { MdDelete, MdAdd, MdSave } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import styles from "./styles.module.css";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";

export default function EditPage() {
  const { slug } = useParams();

  const [form, setForm] = useState({
    id: null,
    name: "",
    members: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/team?name=${slug}`);
        const data = await res.json();

        if (data && data.length > 0 && data[0].Page) {
          const pageData = data[0].Page;

          if (
            !pageData.members ||
            !Array.isArray(pageData.members) ||
            pageData.members.length === 0
          ) {
            pageData.members = [
              {
                name: "New Member",
                email: "",
                position: "",
              },
            ];
          }

          setForm(pageData);
        } else {
          Swal.fire("Warning", "Team page not found.", "warning");
        }
      } catch (err) {
        console.error("Failed to fetch team data:", err);
        Swal.fire("Error", "Failed to load team page.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const handleChangeMember = (index, key, value) => {
    setForm((prev) => {
      const updatedMembers = [...prev.members];
      updatedMembers[index][key] = value;
      return { ...prev, members: updatedMembers };
    });
  };

  const handleAddMember = () => {
    setForm((prev) => ({
      ...prev,
      members: [...prev.members, { name: "", email: "", position: "" }],
    }));
  };

  const handleDeleteMember = (index) => {
    if (form.members.length <= 1) {
      Swal.fire("Warning", "At least one member is required.", "warning");
      return;
    }

    Swal.fire({
      title: "Delete Member",
      text: "Are you sure you want to delete this member?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm((prev) => {
          const updatedMembers = [...prev.members];
          updatedMembers.splice(index, 1);
          return { ...prev, members: updatedMembers };
        });
        Swal.fire("Deleted!", "Member has been removed.", "success");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id) {
      Swal.fire("Error", "Team page ID not found.", "error");
      return;
    }

    try {
      const token = Cookies.get("token");

      const res = await fetch(`/api/team?id=${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          isactive: true,
          members: form.members,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Update failed.");
      }

      Swal.fire("Success", "Team updated successfully.", "success");
    } catch (err) {
      console.error("PUT error:", err);
      Swal.fire(
        "Error",
        err.message || "An error occurred while updating the team.",
        "error"
      );
    }
  };

  return (
  <Layout>
  <div className={styles.container}>
    <h2 className={styles.pageTitle}>Edit Team Page: {form.name}</h2>

    {loading ? (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className={styles.form}>
        {form.members.map((member, index) => (
          <div key={index} className={styles.memberCard}>
            <div className={styles.memberHeader}>
              <h4>Member #{index + 1}</h4>
              <button
                type="button"
                onClick={() => handleDeleteMember(index)}
                className={styles.memberDeleteBtn}
                title="Remove Member"
              >
                <MdDelete size={18} />
              </button>
            </div>

            <div className={styles.memberGrid}>
              <div className={styles.inputGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) =>
                    handleChangeMember(index, "name", e.target.value)
                  }
                  className={styles.input}
                  placeholder="Member name"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="text"
                  value={member.email}
                  onChange={(e) =>
                    handleChangeMember(index, "email", e.target.value)
                  }
                  className={styles.input}
                  placeholder="Email address"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Position</label>
                <input
                  type="text"
                  value={member.position}
                  onChange={(e) =>
                    handleChangeMember(index, "position", e.target.value)
                  }
                  className={styles.input}
                  placeholder="Job title or role"
                />
              </div>
            </div>
          </div>
        ))}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleAddMember}
            className={styles.addButton}
          >
            <MdAdd size={20} />
            Add New Member
          </button>

          <button type="submit" className={styles.submitButton}>
            <MdSave size={20} />
            UPDATE
          </button>
        </div>
      </form>
    )}
  </div>
</Layout>

  );
}
