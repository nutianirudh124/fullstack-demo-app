import { useState } from "react";
import Dashboard from "./components/Dashboard";
import ExpenseTable from "./components/ExpenseTable";
import { LayoutDashboard, Table } from "lucide-react";

type Tab = "dashboard" | "expenses";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Expense Manager</h1>
          <nav className="flex gap-1">
            <TabButton
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Dashboard"
            />
            <TabButton
              active={tab === "expenses"}
              onClick={() => setTab("expenses")}
              icon={<Table className="w-4 h-4" />}
              label="Expenses"
            />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "dashboard" ? <Dashboard /> : <ExpenseTable />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
