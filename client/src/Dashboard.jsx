import React from "react";
import PropTypes from "prop-types";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard({ transactions = [], frauds = [] }) {
  const total = transactions.length;
  const allowed = transactions.filter((t) => t.decision === "allow").length;
  const blocked = transactions.filter((t) => t.decision === "block").length;
  const review = transactions.filter((t) => t.decision === "review").length;
  const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : 0;

  const COLORS = ["#22c55e", "#f97316", "#ef4444"];

  const barData = [
    { name: "Allowed", value: allowed },
    { name: "Review", value: review },
    { name: "Blocked", value: blocked },
  ];

  const pieData = [
    { name: "Safe", value: allowed + review },
    { name: "Fraud", value: blocked },
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
        🧠 Cyber Security Operations Center
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Summary Stats */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Transaction Overview</h2>
          <p>Total: {total}</p>
          <p className="text-green-400">Allowed: {allowed}</p>
          <p className="text-yellow-400">Review: {review}</p>
          <p className="text-red-400">Blocked: {blocked}</p>
          <p className="text-cyan-400 mt-2">Block Rate: {blockRate}%</p>
        </div>

        {/* Charts */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-8">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fraud Table */}
      <div className="mt-10 bg-slate-800/60 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">⚠️ Fraudulent Transactions (Database)</h2>
        {frauds.length === 0 ? (
          <p className="text-gray-400">No fraudulent transactions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-700">
            {frauds.map((f, i) => (
              <li key={i} className="py-2">
                <p>
                  <strong>{f.time}</strong> — ₹{f.amount} — {f.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  transactions: PropTypes.array,
  frauds: PropTypes.array,
};
