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

  const [isClient, setIsClient] = useState(false); // Track if it's client-side

  useEffect(() => {
    setIsClient(true); // Set to true once client-side code runs
  }, []);

  // Fetch categories only after component mounts on the client
  useEffect(() => {
    async function fetchUserAndCategories() {
      try {
        const catRes = await fetch(`/api/categories`);
        const categoryData = await catRes.json();
        setCategories(categoryData.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    if (isClient) {
      // Only fetch data after component has mounted on client
      fetchUserAndCategories();
    }
  }, [isClient]);

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
    return form.username.trim() && selectedCategories.size > 0;
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
        text: selectedCategories.size === 0
          ? "At least one category must be selected."
          : "Username is required.",
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

    Swal.fire({
      title: "Creating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = Cookies.get("token");

      // Update user info
      const updateData = { ...form };
      if (!updateData.password.trim()) delete updateData.password;

      const userRes = await fetch(`/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const userResponse = await userRes.json();

      if (!userRes.ok) {
        let errorMsg = userResponse.error || "User creation failed.";
        if (userResponse.details && Array.isArray(userResponse.details)) {
          errorMsg += "\n" + userResponse.details.join("\n");
        }
        throw new Error(errorMsg);
      }

      const userId = userResponse.userId; // Ensure the API returns the userId

      const newCategories = Array.from(selectedCategories);

      const permissionPayload = {
        user_id: userId, // Use the userId from the response
        category_ids: newCategories,
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
      };

      const permissionRes = await fetch(`/api/categorypermissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(permissionPayload),
      });

      if (!permissionRes.ok) throw new Error("Permission Create failed");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User and permissions created successfully.",
      }).then(() => router.push("/users"));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "An error occurred during user creation.",
      });
    }
  };

  const stats = {
    total: categories.length,
    selected: selectedCategories.size,
  };

  if (!isClient) {
    return null; // Prevent rendering on server-side
  }

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
              Create User
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
