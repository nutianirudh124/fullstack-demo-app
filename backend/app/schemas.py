from datetime import date

from pydantic import BaseModel


class ExpenseBase(BaseModel):
    date: date
    category: str
    sub_category: str
    description: str
    amount: float
    is_recurring: bool = False


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int

    model_config = {"from_attributes": True}


class CategorySummary(BaseModel):
    category: str
    total: float


class SubCategorySummary(BaseModel):
    sub_category: str
    total: float


class ExpenseSummary(BaseModel):
    total_spent: float
    by_category: list[CategorySummary]
    by_sub_category: list[SubCategorySummary]
