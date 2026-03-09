import axios from "axios";
import type { Expense, ExpenseSummary } from "../types";

const api = axios.create({ baseURL: "/api/expenses" });

export async function fetchExpenses(params?: {
  category?: string;
  sub_category?: string;
}): Promise<Expense[]> {
  const { data } = await api.get("", { params });
  return data;
}

export async function fetchSummary(): Promise<ExpenseSummary> {
  const { data } = await api.get("/summary");
  return data;
}

export async function createExpense(
  expense: Omit<Expense, "id">
): Promise<Expense> {
  const { data } = await api.post("", expense);
  return data;
}

export async function updateExpense(
  id: number,
  expense: Omit<Expense, "id">
): Promise<Expense> {
  const { data } = await api.put(`/${id}`, expense);
  return data;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/${id}`);
}

export async function seedDatabase(): Promise<void> {
  await api.post("/seed");
}
