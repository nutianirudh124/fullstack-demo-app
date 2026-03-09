export interface Expense {
  id: number;
  date: string;
  category: string;
  sub_category: string;
  description: string;
  amount: number;
  is_recurring: boolean;
}

export interface CategorySummary {
  category: string;
  total: number;
}

export interface SubCategorySummary {
  sub_category: string;
  total: number;
}

export interface ExpenseSummary {
  total_spent: number;
  by_category: CategorySummary[];
  by_sub_category: SubCategorySummary[];
}
