import { useEffect, useState } from "react";
import { fetchSummary } from "../api/expenses";
import type { ExpenseSummary } from "../types";
import Charts from "./Charts";
import { IndianRupee, TrendingDown, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  useEffect(() => {
    fetchSummary().then(setSummary);
  }, []);

  if (!summary) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  const needsTotal =
    summary.by_category.find((c) => c.category === "Needs")?.total ?? 0;
  const wantsTotal =
    summary.by_category.find((c) => c.category === "Wants")?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Spent"
          value={summary.total_spent}
          icon={<IndianRupee className="w-5 h-5" />}
          color="bg-red-50 text-red-700 border-red-200"
        />
        <SummaryCard
          title="Needs"
          value={needsTotal}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-blue-50 text-blue-700 border-blue-200"
        />
        <SummaryCard
          title="Wants"
          value={wantsTotal}
          icon={<TrendingDown className="w-5 h-5" />}
          color="bg-amber-50 text-amber-700 border-amber-200"
        />
      </div>
      <Charts summary={summary} />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">
        ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}
