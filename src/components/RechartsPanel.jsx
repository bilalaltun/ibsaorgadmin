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

// Groups data by field (e.g. city, country, etc.)
const groupByField = (logs, field) => {
  const map = {};
  logs.forEach((log) => {
    const key = log[field] ?? "Unknown";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

// Prepares chart data based on time
const getDurationData = (logs) => {
  const map = {};
  logs.forEach((log) => {
    const time = new Date(log.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    map[time] = (map[time] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

export default function RechartsPanel({ allLogs }) {
  const charts = [
    { title: "City", data: groupByField(allLogs, "city") },
    { title: "Country", data: groupByField(allLogs, "country") },
    { title: "Device", data: groupByField(allLogs, "is_mobile") },
    { title: "Timezone", data: groupByField(allLogs, "timezone") },
  ];

  const durationData = getDurationData(allLogs);

  return (
    <>
      <div className={styles.chartGrid}>
        {charts.map(({ title, data }, idx) => (
          <div className={styles.chartBox} key={idx}>
            <h3>📊 Distribution by {title}</h3>
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
        <h3>⏱ Time Spent on Site</h3>
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
