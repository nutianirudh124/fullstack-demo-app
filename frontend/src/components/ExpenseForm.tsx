import { useState } from "react";
import { createExpense, updateExpense } from "../api/expenses";
import type { Expense } from "../types";
import { X } from "lucide-react";

interface Props {
  expense: Expense | null;
  onSaved: () => void;
  onCancel: () => void;
}

const SUB_CATEGORIES = [
  "Transport",
  "Food & Drinks",
  "Sports",
  "Accessories",
  "Clothing",
  "Monthly Payments",
  "Misc",
];

export default function ExpenseForm({ expense, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    date: expense?.date ?? new Date().toISOString().slice(0, 10),
    category: expense?.category ?? "Wants",
    sub_category: expense?.sub_category ?? "Food & Drinks",
    description: expense?.description ?? "",
    amount: expense?.amount?.toString() ?? "",
    is_recurring: expense?.is_recurring ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
    };
    if (expense) {
      await updateExpense(expense.id, payload);
    } else {
      await createExpense(payload);
    }
    onSaved();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">
          {expense ? "Edit Expense" : "New Expense"}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-xs font-medium text-gray-500">Date</span>
          <input
            type="date"
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-500">Category</span>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option>Needs</option>
            <option>Wants</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-500">Sub-Category</span>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.sub_category}
            onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
          >
            {SUB_CATEGORIES.map((sc) => (
              <option key={sc}>{sc}</option>
            ))}
          </select>
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-gray-500">Description</span>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-500">Amount (₹)</span>
          <input
            type="number"
            step="0.01"
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={form.is_recurring}
            onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">Recurring</span>
        </label>
        <div className="self-end pb-1">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            {expense ? "Update" : "Add"} Expense
          </button>
        </div>
      </form>
    </div>
  );
}
