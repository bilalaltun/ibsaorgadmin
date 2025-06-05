import React from "react";

export default function HtmlPreviewComponent({
  html,
  onDelete,
}: {
  html: string;
  onDelete: () => void;
}) {
  return (
    <div style={{ position: "relative", padding: "10px", border: "1px solid #ccc" }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <button
        onClick={onDelete}
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: 4,
          padding: "2px 6px",
          cursor: "pointer"
        }}
      >
        Sil
      </button>
    </div>
  );
}
