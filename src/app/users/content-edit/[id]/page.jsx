"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Cookies from "js-cookie";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    isactive: true,
    date: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [originalCategories, setOriginalCategories] = useState(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [existingPermissionMap, setExistingPermissionMap] = useState({}); // key = category_id, value = permission_id

  useEffect(() => {
    async function fetchUserAndCategories() {
      try {
        const [userRes, catRes, permRes] = await Promise.all([
          fetch(`/api/users?id=${id}`),
          fetch(`/api/categories`),
          fetch(`/api/categorypermissions?user_id=${id}`),
        ]);

        if (!userRes.ok) throw new Error("User fetch failed");
        const userData = await userRes.json();
        setForm({
          username: userData.username,
          password: "",
          isactive: userData.isactive,
          date: userData.date,
        });

        const categoryData = await catRes.json();
        setCategories(categoryData.data || []);

        const permData = await permRes.json();
        const userCategories = new Set();
        const permMap = {};
        permData.forEach((p) => {
          if (p.can_create || p.can_read || p.can_update || p.can_delete) {
            userCategories.add(p.category_id);
            permMap[p.category_id] = p.id; // store permission row ID for PUT
          }
        });

        setSelectedCategories(userCategories);
        setOriginalCategories(new Set(userCategories));
        setExistingPermissionMap(permMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndCategories();
  }, [id]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(categoryId)
        ? newSet.delete(categoryId)
        : newSet.add(categoryId);
      return newSet;
    });
    setIsDirty(true);
  };

  const selectAllCategories = () => {
    setSelectedCategories(new Set(categories.map((cat) => cat.id)));
    setIsDirty(true);
  };

  const deselectAllCategories = () => {
    setSelectedCategories(new Set());
    setIsDirty(true);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const isFormValid = () => {
    return form.username.trim();
  };

  const hasChanges = () => {
    const categoriesChanged =
      selectedCategories.size !== originalCategories.size ||
      [...selectedCategories].some((id) => !originalCategories.has(id));
    return isDirty || categoriesChanged;
  };

  const resetForm = () => {
    setSelectedCategories(new Set(originalCategories));
    setIsDirty(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Username is required.",
      });
      return;
    }

    if (!hasChanges()) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "No changes detected to save.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to update this user and their permissions?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");

      // Update user info
      const updateData = { ...form };
      if (!updateData.password.trim()) delete updateData.password;

      const userRes = await fetch(`/api/users?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!userRes.ok) throw new Error("User update failed");

      // Prepare permission payload
      const oldCategories = Array.from(originalCategories);
      const newCategories = Array.from(selectedCategories);
      const isUpdating = oldCategories.length > 0;

      const permissionPayload = {
        category_ids: newCategories,
      };

      const method = isUpdating ? "PUT" : "POST";
      const url = `/api/categorypermissions${method === "PUT" ? `?user_id=${id}` : ""}`;

      const permissionRes = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(permissionPayload),
      });

      if (!permissionRes.ok) throw new Error("Permission update failed");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User and permissions updated successfully.",
      }).then(() => router.push("/users"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during update.",
      });
    }
  };

  const stats = {
    total: categories.length,
    selected: selectedCategories.size,
  };

  return (
    <Layout>
      <div>
        <h2 className={styles.title}>Edit User – #{id}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.userSection}>
              <h3 className={styles.sectionTitle}>User Information</h3>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Username </label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="New Password"
                  />
                </div>
                <small className={styles.hint}>
                  Leave empty to keep the current password
                </small>
              </div>
            </div>

            <div className={styles.permissionsSection}>
              <div className={styles.permissionsHeader}>
                <h3 className={styles.sectionTitle}>Category Access</h3>
                <div className={styles.categoryStats}>
                  <span className={styles.stat}>
                    {stats.selected}/{stats.total} categories selected
                  </span>
                  <div className={styles.bulkActions}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={selectAllCategories}
                      disabled={stats.selected === stats.total}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={deselectAllCategories}
                      disabled={stats.selected === 0}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <label key={cat.id} className={styles.categoryOption}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span className={styles.categoryLabel}>
                      <span className={styles.categoryIcon}>📁</span>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isFormValid() || !hasChanges()}
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
