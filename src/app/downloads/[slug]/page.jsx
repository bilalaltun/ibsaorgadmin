"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { MdDelete, MdAdd, MdSave } from "react-icons/md";
import { FaTrash, FaPlus } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import styles from "./styles.module.css";
import Layout from "@/components/Layout";
import Cookies from "js-cookie";
import UploadField from "@/components/UploadField/UploadField";

export default function EditPage() {
  const { slug } = useParams();

  const [form, setForm] = useState({
    name: "",
    CategoryTab: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/downloadfile?name=${slug}`);
        const data = await res.json();

        if (data.Pages && data.Pages.length > 0) {
          let pageData = data.Pages[0];

          if (
            !pageData.CategoryTab ||
            !Array.isArray(pageData.CategoryTab) ||
            pageData.CategoryTab.length === 0
          ) {
            pageData.CategoryTab = [
              {
                Title: "New Category",
                Files: [
                  {
                    title: "New File",
                    fileurl: "",
                  },
                ],
              },
            ];
          }

          setForm(pageData);
        } else {
          Swal.fire("Warning", "Page not found", "warning");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        Swal.fire("Error", "Failed to load page data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const handleChangeFile = (catIndex, fileIndex, key, value) => {
    setForm((prev) => {
      const newTabs = [...prev.CategoryTab];
      const files = [...newTabs[catIndex].Files];
      files[fileIndex][key] = value;
      newTabs[catIndex].Files = files;
      return { ...prev, CategoryTab: newTabs };
    });
  };

  const handleChangeCategoryTitle = (catIndex, value) => {
    setForm((prev) => {
      const newTabs = [...prev.CategoryTab];
      newTabs[catIndex].Title = value;
      return { ...prev, CategoryTab: newTabs };
    });
  };

  const handleAddCategory = () => {
    const newCategory = {
      Title: "New Category",
      Files: [
        {
          title: "New File",
          fileurl: "",
        },
      ],
    };
    setForm((prev) => ({
      ...prev,
      CategoryTab: [...prev.CategoryTab, newCategory],
    }));
  };

  const handleDeleteCategory = (catIndex) => {
    Swal.fire({
      title: "Delete Category",
      text: "Are you sure you want to delete this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm((prev) => {
          const newTabs = [...prev.CategoryTab];
          newTabs.splice(catIndex, 1);
          return { ...prev, CategoryTab: newTabs };
        });
        Swal.fire(
          "Deleted!",
          "Category has been deleted successfully.",
          "success"
        );
      }
    });
  };

  const handleAddFile = (catIndex) => {
    setForm((prev) => {
      const newTabs = [...prev.CategoryTab];
      newTabs[catIndex].Files.push({ title: "", fileurl: "" });
      return { ...prev, CategoryTab: newTabs };
    });
  };

  const handleDeleteFile = (catIndex, fileIndex) => {
    // Check if at least one file should remain
    if (form.CategoryTab[catIndex].Files.length <= 1) {
      Swal.fire(
        "Warning",
        "Each category must have at least one file.",
        "warning"
      );
      return;
    }

    Swal.fire({
      title: "Delete File",
      text: "Are you sure you want to delete this file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm((prev) => {
          const newTabs = [...prev.CategoryTab];
          newTabs[catIndex].Files.splice(fileIndex, 1);
          return { ...prev, CategoryTab: newTabs };
        });
        Swal.fire("Deleted!", "File has been deleted successfully.", "success");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id) {
      Swal.fire("Error", "Page ID not found.", "error");
      return;
    }

    try {
      const token = Cookies.get("token");

      const res = await fetch(`/api/downloadfile?id=${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token if required
        },
        body: JSON.stringify({
          name: form.name,
          isactive: true, // Optional: you can replace this with a checkbox toggle
          CategoryTab: form.CategoryTab,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Update failed.");
      }

      Swal.fire("Success", "Page updated successfully.", "success");
    } catch (err) {
      console.error("PUT error:", err);
      Swal.fire(
        "Error",
        err.message || "An error occurred while updating the page.",
        "error"
      );
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2>Edit Page: {form.name}</h2>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
              {form.CategoryTab.map((cat, catIndex) => (
                <div key={catIndex} className={styles.card}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryTitleGroup}>
                      <label>Category Name</label>
                      <input
                        type="text"
                        value={cat.Title}
                        onChange={(e) =>
                          handleChangeCategoryTitle(catIndex, e.target.value)
                        }
                        className={styles.input}
                        placeholder="Enter category name"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(catIndex)}
                      className={styles.deleteButton}
                      title="Delete Category"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>

                  <div className={styles.filesContainer}>
                    {cat.Files.map((file, fileIndex) => (
                      <div key={fileIndex} className={styles.fileRow}>
                        <div className={styles.fileInputs}>
                          <div className={styles.inputGroup}>
                            <label>File Title</label>
                            <input
                              type="text"
                              value={file.title}
                              onChange={(e) =>
                                handleChangeFile(
                                  catIndex,
                                  fileIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                              className={styles.input}
                              placeholder="Enter file title"
                            />
                          </div>

                          <div className={styles.inputGroup}>
                            <label>File URL</label>
                            <UploadField
                              type="file"
                              value={file.fileurl}
                              label={`File`}
                              onChange={(url) =>
                                handleChangeFile(
                                  catIndex,
                                  fileIndex,
                                  "fileurl",
                                  url
                                )
                              }
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(catIndex, fileIndex)}
                          className={styles.deleteFileButton}
                          title="Delete File"
                        >
                          <IoMdClose size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddFile(catIndex)}
                    className={styles.addFileButton}
                  >
                    <FaPlus size={14} />
                    Add File
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddCategory}
                className={styles.addButton}
              >
                <MdAdd size={20} />
                Add New Category
              </button>

              <button type="submit" className={styles.submitButton}>
                <MdSave size={20} />
                UPDATE
              </button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
