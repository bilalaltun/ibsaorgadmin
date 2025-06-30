"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import styles from "./dashboard.module.css";

const RechartsPanel = dynamic(() => import("@/components/RechartsPanel"), {
  ssr: false,
});

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [logStats, setLogStats] = useState({
    total: 0,
    mobileCount: 0,
    desktopCount: 0,
    uniqueIps: 0,
  });
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
    99: "Dolu ve fırtına",
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/log?page=1&limit=10`);
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      console.error("Log verisi alınamadı:", err);
    }
  };

  const fetchAllLogs = async () => {
    try {
      const res = await fetch("/api/log?all=true");
      const data = await res.json();
      setAllLogs(data.data || []);

      const uniqueIps = new Set(data.data.map((log) => log.ip_address)).size;
      const mobileCount = data.data.filter((log) => log.is_mobile).length;
      const desktopCount = data.data.length - mobileCount;

      setLogStats({
        total: data.data.length,
        uniqueIps,
        mobileCount,
        desktopCount,
      });
    } catch (err) {
      console.error("Tüm loglar alınamadı:", err);
    }
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
        description: weatherCodes[data.weathercode] ?? "Bilinmeyen",
      });
    };

    fetchStats();
    fetchWeather();
    fetchLogs();
    // fetchAllLogs();
  }, []);

  const handleGenerate = async () => {
    if (!prompt?.trim()) return;
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
        <h1 className={styles.title}>HIGHLIGHT VEBSAYTI İDARƏ PANELİ</h1>

        <div className={styles.cards}>
          <div className={styles.card}>
            <span>📦</span>
            <div>
              <p>Ümumi Məhsul</p>
              <strong>{stats?.product_count ?? "..."}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>📝</span>
            <div>
              <p>Ümumi Bloq</p>
              <strong>{stats?.blog_count ?? "..."}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>👥</span>
            <div>
              <p>Ümumi İstifadəçi</p>
              <strong>{stats?.user_count ?? "..."}</strong>
            </div>
          </div>
        </div>

        <div className={styles.weather}>
          <div className={styles.weatherHeader}>
            <h2>🌤 Bakı Hava Proqnozu</h2>
            <span className={styles.badge}>
              {weather?.description ?? "..."}
            </span>
          </div>
          <div className={styles.weatherStats}>
            <div className={styles.weatherItem}>
              <span>🌡</span>
              <div>
                <p>Temperatur</p>
                <strong>{weather?.temperature ?? "..."}°C</strong>
              </div>
            </div>
            <div className={styles.weatherItem}>
              <span>💨</span>
              <div>
                <p>Külək</p>
                <strong>{weather?.windspeed ?? "..."} m/s</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <span>📈</span>
            <div>
              <p>Ümumi Ziyarət</p>
              <strong>{logStats.total}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>📱</span>
            <div>
              <p>Mobil Cihaz</p>
              <strong>{logStats.mobileCount}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>🖥</span>
            <div>
              <p>Masaüstü Cihaz</p>
              <strong>{logStats.desktopCount}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>🔢</span>
            <div>
              <p>Unikal IP</p>
              <strong>{logStats.uniqueIps}</strong>
            </div>
          </div>
        </div>

        <RechartsPanel allLogs={allLogs} />

        <div className={styles.visitorLogs}>
          <h2>🧾 Son Ziyarətçilər</h2>
          <div className={styles.logTable}>
            <div className={styles.logHeader}>
              <span>IP</span>
              <span>Şəhər</span>
              <span>Ölkə</span>
              <span>Səhifə</span>
              <span>Müddət</span>
              <span>Vaxt</span>
              <span>Saat Qurşağı</span>
              <span>Cihaz</span>
              <span>Platforma</span>
              <span>Bot?</span>
              <span>Ekran İcazəsi</span>
              <span>Lat / Long</span>
            </div>
            {logs.map((log) => (
              <div key={log.id} className={styles.logRow}>
                <span>{log.ip_address}</span>
                <span>{log.city}</span>
                <span>{log.country}</span>
                <span>{log.page}</span>
                <span>{log.duration_seconds}s</span>
                <span>{new Date(log.created_at).toLocaleString()}</span>
                <span>{log.timezone}</span>
                <span>{log.is_mobile ? "Mobil" : "Masaüstü"}</span>
                <span>{log.platform}</span>
                <span>{log.is_bot ? "Bəli" : "Xeyr"}</span>
                <span>{log.screen_resolution}</span>
                <span>
                  {log.latitude}, {log.longitude}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.generator}>
          <h2>🧠 Məzmun Yaradılması</h2>
          <textarea
            placeholder="Əmr daxil edin..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Yaradılır..." : "Yarat"}
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
