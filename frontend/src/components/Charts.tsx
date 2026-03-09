import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ExpenseSummary } from "../types";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) {
  const pct = percent ?? 0;
  if (pct < 0.03) return null; // hide labels for tiny slices
  const radius = (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * 1.4;
  const x = (cx ?? 0) + radius * Math.cos(-1 * (midAngle ?? 0) * RADIAN);
  const y = (cy ?? 0) + radius * Math.sin(-1 * (midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="#374151" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(pct * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Charts({ summary }: { summary: ExpenseSummary }) {
  const pieData = summary.by_sub_category.map((s) => ({
    name: s.sub_category,
    value: Math.abs(s.total),
  }));

  const barData = summary.by_category.map((c) => ({
    name: c.category,
    amount: c.total,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">
          Spending by Sub-Category
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomLabel}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) =>
                `₹${(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
              }
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">
          Needs vs Wants
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number | undefined) =>
                `₹${(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
              }
            />
            <Legend />
            <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
