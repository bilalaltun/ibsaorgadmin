"use client";

import React from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip as RechartTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Veriləri sahəyə görə qruplaşdırır (məsələn: şəhər, ölkə və s.)
const groupByField = (logs, field) => {
  const map = {};
  logs.forEach((log) => {
    const key = log[field] ?? "Bilinməyən";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

// Zaman əsasında qrafik məlumatı hazırlayır
const getDurationData = (logs) => {
  const map = {};
  logs.forEach((log) => {
    const time = new Date(log.created_at).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    map[time] = (map[time] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

export default function RechartsPanel({ allLogs }) {
  const charts = [
    { title: "Şəhər", data: groupByField(allLogs, "city") },
    { title: "Ölkə", data: groupByField(allLogs, "country") },
    { title: "Cihaz", data: groupByField(allLogs, "is_mobile") },
    { title: "Saat Qurşağı", data: groupByField(allLogs, "timezone") },
  ];

  const durationData = getDurationData(allLogs);

  return (
    <>
      <div className={styles.chartGrid}>
        {charts.map(({ title, data }, idx) => (
          <div className={styles.chartBox} key={idx}>
            <h3>📊 {title} Üzrə Paylanma</h3>
            <PieChart width={300} height={300}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartTooltip />
            </PieChart>
          </div>
        ))}
      </div>

      <div className={styles.lineChartBox}>
        <h3>⏱ Saytda Qalma Müddəti</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={durationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <RechartTooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
