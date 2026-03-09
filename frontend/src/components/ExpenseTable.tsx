import { useEffect, useState } from "react";
import { fetchExpenses, deleteExpense } from "../api/expenses";
import type { Expense } from "../types";
import ExpenseForm from "./ExpenseForm";
import { Pencil, Trash2, Plus, Filter } from "lucide-react";

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    const params: Record<string, string> = {};
    if (filterCategory) params.category = filterCategory;
    fetchExpenses(params).then(setExpenses);
  };

  useEffect(load, [filterCategory]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this expense?")) return;
    await deleteExpense(id);
    load();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Needs">Needs</option>
            <option value="Wants">Wants</option>
          </select>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {(showForm || editing) && (
        <ExpenseForm
          expense={editing}
          onSaved={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Sub-Category</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-center">Recurring</th>
              <th className="px-4 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr
                key={exp.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 text-gray-700">{exp.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      exp.category === "Needs"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {exp.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{exp.sub_category}</td>
                <td className="px-4 py-3 text-gray-800">{exp.description}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    exp.amount < 0 ? "text-green-600" : "text-gray-800"
                  }`}
                >
                  ₹
                  {Math.abs(exp.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                  {exp.amount < 0 && " (refund)"}
                </td>
                <td className="px-4 py-3 text-center">
                  {exp.is_recurring ? (
                    <span className="text-green-600 text-xs font-medium">
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(exp);
                        setShowForm(false);
                      }}
                      className="text-gray-400 hover:text-indigo-600 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No expenses found.
          </div>
        )}
      </div>
    </div>
  );
}
