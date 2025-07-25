"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/components/Layout";

// Utility to format date as dd mm yyyy HH:MM
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function MediaAccreditationShowPage(props) {
  // Use useParams to get the id in a future-proof way
  const params = useParams ? useParams() : props.params;
  const id = params?.id;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/media-accreditation?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch record.");
        const data = await res.json();
        setItem(data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  return (
    <Layout>
      <div
        style={{
          margin: "2rem auto",
          padding: 0,
          background: "#f7f9fa",
          borderRadius: 16,
          boxShadow: "0 4px 24px #0002",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: 24, borderBottom: "1px solid #e0e0e0" }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 28, color: "#222" }}>Form Submission Details</h2>
        </div>
        <div style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, color: "#1976d2", fontWeight: 600, fontSize: 20 }}>Personal Info</h3>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 4px #0001",
            padding: 20,
            marginBottom: 32,
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 500, color: "#888" }}>Title</div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>{item?.title || "-"}</div>
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 500, color: "#888" }}>First Name</div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>{item?.firstName || "-"}</div>
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 500, color: "#888" }}>Last Name</div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>{item?.lastName || "-"}</div>
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 500, color: "#888" }}>Company</div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>{item?.company || "-"}</div>
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 500, color: "#888" }}>City</div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>{item?.city || "-"}</div>
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 500, color: "#888" }}>Country</div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>{item?.country || "-"}</div>
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 500, color: "#888" }}>Email</div>
                {item?.email ? (
                  <a
                    href={`mailto:${item.email}`}
                    style={{
                      fontWeight: 600,
                      color: "#1976d2",
                      fontSize: 16,
                      textDecoration: "underline dotted",
                      wordBreak: "break-all"
                    }}
                  >
                    {item.email}
                  </a>
                ) : (
                  <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>-</div>
                )}
              </div>
            </div>
          </div>
          <h3 style={{ marginTop: 0, marginBottom: 16, color: "#1976d2", fontWeight: 600, fontSize: 20 }}>Submission Details</h3>

          <div style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 4px #0001",
            padding: 20,
            marginBottom: 0,
          }}>
             <div style={{ display: "flex", gap: 32 }}>
              <div>
                <div style={{ fontWeight: 500, color: "#888" }}>Created At</div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>{formatDate(item?.created_at)}</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, color: "#888" }}>Message</div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#222",
                  fontSize: 16,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "#f5f5f5",
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxShadow: "0 1px 2px #0001"
                }}
              >
                {item?.message || "-"}
              </div>
            </div>
           
          </div>
        </div>
      </div>
    </Layout>
  );
}
