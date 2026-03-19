import React, { useEffect, useState } from "react";
import "./Stats.css";
import { db } from "../Backend/firebase-init";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Stats() {
  const [data, setData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    presentations: 0,
    views: 0,
    reads: 0,
    followers: 0,
    subscribers: 0
  });

  const [lifetimeStats, setLifetimeStats] = useState({
    presentations: 0,
    views: 0,
    reads: 0
  });

  useEffect(() => {
    const q = query(collection(db, "stats"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let tempData = [];
      let monthly = {
        presentations: 0,
        views: 0,
        reads: 0,
        followers: 0,
        subscribers: 0
      };

      let lifetime = {
        presentations: 0,
        views: 0,
        reads: 0
      };

      const currentMonth = new Date().getMonth();

      snapshot.forEach((doc) => {
        const item = doc.data();
        const date = item.createdAt?.toDate();

        // Graph data
        tempData.push({
          date: date?.toLocaleDateString("en-IN", { day: "numeric" }),
          views: item.views || 0,
          reads: item.reads || 0
        });

        // Lifetime
        lifetime.presentations += item.presentations || 0;
        lifetime.views += item.views || 0;
        lifetime.reads += item.reads || 0;

        // Monthly filter
        if (date && date.getMonth() === currentMonth) {
          monthly.presentations += item.presentations || 0;
          monthly.views += item.views || 0;
          monthly.reads += item.reads || 0;
          monthly.followers += item.followers || 0;
          monthly.subscribers += item.subscribers || 0;
        }
      });

      setData(tempData);
      setMonthlyStats(monthly);
      setLifetimeStats(lifetime);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="stats-container">
      <h2 className="title">Stats</h2>

      {/* Monthly Section */}
      <div className="section">
        <div className="section-header">
          <h3>Monthly</h3>
          <span className="date-range">Updated hourly</span>
        </div>

        <div className="stats-grid">
          <StatCard label="Presentations" value={monthlyStats.presentations} />
          <StatCard label="Views" value={monthlyStats.views} />
          <StatCard label="Reads" value={monthlyStats.reads} />
          <StatCard label="Followers" value={monthlyStats.followers} />
          <StatCard label="Subscribers" value={monthlyStats.subscribers} />
        </div>

        {/* Chart */}
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#4CAF50" />
              <Line type="monotone" dataKey="reads" stroke="#2196F3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lifetime Section */}
      <div className="section">
        <div className="section-header">
          <h3>Lifetime</h3>
        </div>

        <div className="stats-grid">
          <StatCard label="Presentations" value={lifetimeStats.presentations} />
          <StatCard label="Views" value={lifetimeStats.views} />
          <StatCard label="Reads" value={lifetimeStats.reads} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}