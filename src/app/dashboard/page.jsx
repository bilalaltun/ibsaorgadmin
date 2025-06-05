"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const weatherCodes = {
    0: "Açık",
    1: "Genel olarak açık",
    2: "Parçalı bulutlu",
    3: "Kapalı",
    45: "Sisli",
    48: "Yoğun sis",
    51: "Çok hafif yağmur",
    53: "Hafif yağmur",
    55: "Yağmur",
    61: "Hafif sağanak",
    63: "Orta şiddetli sağanak",
    65: "Şiddetli sağanak",
    80: "Sağanak yağmur",
    95: "Fırtına",
    99: "Dolu ve fırtına"
  };

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data);
    };

    const fetchWeather = async () => {
      const res = await fetch("/api/dashboard/weather");
      const data = await res.json();
      setWeather({
        temperature: data.temperature,
        windspeed: data.windspeed,
        description: weatherCodes[data.weathercode] ?? "Bilinmeyen"
      });
    };

    fetchStats();
    fetchWeather();
  }, []);

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
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>MIZRAK MAKİNE SİTE YÖNETİM PANELİ</h1>

        <div className={styles.cards}>
          <div className={styles.card}>
            <span>📦</span>
            <div>
              <p>Toplam Ürün</p>
              <strong>{stats?.product_count ?? "..."}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>📝</span>
            <div>
              <p>Toplam Blog</p>
              <strong>{stats?.blog_count ?? "..."}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>👥</span>
            <div>
              <p>Toplam Kullanıcı</p>
              <strong>{stats?.user_count ?? "..."}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>🌐</span>
            <div>
              <p>Toplam Dil</p>
              <strong>{stats?.language_count ?? "..."}</strong>
            </div>
          </div>
        </div>

        <div className={styles.weather}>
          <h2>🌤 Bursa Hava Durumu</h2>
          <p><strong>Sıcaklık:</strong> {weather?.temperature ?? "..."}°C</p>
          <p><strong>Açıklama:</strong> {weather?.description ?? "..."}</p>
          <p><strong>Rüzgar:</strong> {weather?.windspeed ?? "..."} m/sn</p>
        </div>

        <div className={styles.generator}>
          <h2>🧠 İçerik Üretimi</h2>
          <textarea
            placeholder="İçerik üretmek için bir komut girin (max 200 karakter)"
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
      </div>
    </Layout>
  );
}
