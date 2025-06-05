"use client";
import { useState } from "react";
import styles from "./LiveChatBox.module.css";

export default function LiveChatBox() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.content || "Bir çıktı alınamadı.");
    } catch (err) {
      setResponse("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
  };

  return (
    <div className={`${styles.chatbox} ${open ? styles.open : ""}`}>
      <button className={styles.toggleBtn} onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className={styles.panel}>
          <h4>🧠 İçerik Üretimi</h4>
          <textarea
            placeholder="İçerik üretmek için komut girin (max 200 karakter)"
            maxLength={200}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Üretiliyor..." : "Üret"}
          </button>
          {response && (
            <div className={styles.output}>
              <pre>{response}</pre>
              <button onClick={handleCopy}>Kopyala</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
