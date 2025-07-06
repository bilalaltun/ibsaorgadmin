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
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Dense fog",
    51: "Light drizzle",
    53: "Light rain",
    55: "Rain",
    61: "Light showers",
    63: "Moderate showers",
    65: "Heavy showers",
    80: "Rain showers",
    95: "Storm",
    99: "Hail and storm",
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/log?page=1&limit=10`);
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
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
      console.error("Failed to fetch all logs:", err);
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
        description: weatherCodes[data.weathercode] ?? "Unknown",
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
      setResponse(data.content || "No output generated.");
    } catch (err) {
      setResponse("An error occurred.");
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
        <h1 className={styles.title}>IBSA ADMIN PANEL</h1>

        <div className={styles.cards}>
          <div className={styles.card}>
            <span>📦</span>
            <div>
              <p>Total Products</p>
              <strong>{stats?.product_count ?? "..."}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>📝</span>
            <div>
              <p>Total Blogs</p>
              <strong>{stats?.blog_count ?? "..."}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>👥</span>
            <div>
              <p>Total Users</p>
              <strong>{stats?.user_count ?? "..."}</strong>
            </div>
          </div>
        </div>

        <div className={styles.weather}>
          <div className={styles.weatherHeader}>
            <h2>🌤 Baku Weather Forecast</h2>
            <span className={styles.badge}>
              {weather?.description ?? "..."}
            </span>
          </div>
          <div className={styles.weatherStats}>
            <div className={styles.weatherItem}>
              <span>🌡</span>
              <div>
                <p>Temperature</p>
                <strong>{weather?.temperature ?? "..."}°C</strong>
              </div>
            </div>
            <div className={styles.weatherItem}>
              <span>💨</span>
              <div>
                <p>Wind Speed</p>
                <strong>{weather?.windspeed ?? "..."} m/s</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <span>📈</span>
            <div>
              <p>Total Visits</p>
              <strong>{logStats.total}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>📱</span>
            <div>
              <p>Mobile Devices</p>
              <strong>{logStats.mobileCount}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>🖥</span>
            <div>
              <p>Desktop Devices</p>
              <strong>{logStats.desktopCount}</strong>
            </div>
          </div>
          <div className={styles.card}>
            <span>🔢</span>
            <div>
              <p>Unique IPs</p>
              <strong>{logStats.uniqueIps}</strong>
            </div>
          </div>
        </div>

        <RechartsPanel allLogs={allLogs} />

        <div className={styles.visitorLogs}>
          <h2>🧾 Latest Visitors</h2>
          <div className={styles.logTable}>
            <div className={styles.logHeader}>
              <span>IP</span>
              <span>City</span>
              <span>Country</span>
              <span>Page</span>
              <span>Duration</span>
              <span>Time</span>
              <span>Timezone</span>
              <span>Device</span>
              <span>Platform</span>
              <span>Bot?</span>
              <span>Screen</span>
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
                <span>{log.is_mobile ? "Mobile" : "Desktop"}</span>
                <span>{log.platform}</span>
                <span>{log.is_bot ? "Yes" : "No"}</span>
                <span>{log.screen_resolution}</span>
                <span>
                  {log.latitude}, {log.longitude}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
