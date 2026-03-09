from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from .models import Expense
from .schemas import ExpenseCreate, ExpenseUpdate


class ExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        category: str | None = None,
        sub_category: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[Expense]:
        query = self.db.query(Expense)
        if category:
            query = query.filter(Expense.category == category)
        if sub_category:
            query = query.filter(Expense.sub_category == sub_category)
        if start_date:
            query = query.filter(Expense.date >= start_date)
        if end_date:
            query = query.filter(Expense.date <= end_date)
        return query.order_by(Expense.date.desc(), Expense.id.desc()).all()

    def get_by_id(self, expense_id: int) -> Expense | None:
        return self.db.query(Expense).filter(Expense.id == expense_id).first()

    def create(self, data: ExpenseCreate) -> Expense:
        expense = Expense(**data.model_dump())
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def update(self, expense_id: int, data: ExpenseUpdate) -> Expense | None:
        expense = self.get_by_id(expense_id)
        if not expense:
            return None
        for key, value in data.model_dump().items():
            setattr(expense, key, value)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete(self, expense_id: int) -> bool:
        expense = self.get_by_id(expense_id)
        if not expense:
            return False
        self.db.delete(expense)
        self.db.commit()
        return True

    def get_summary(self) -> dict:
        total = self.db.query(func.sum(Expense.amount)).scalar() or 0.0

        by_category = (
            self.db.query(Expense.category, func.sum(Expense.amount))
            .group_by(Expense.category)
            .all()
        )

        by_sub_category = (
            self.db.query(Expense.sub_category, func.sum(Expense.amount))
            .group_by(Expense.sub_category)
            .all()
        )

        return {
            "total_spent": round(total, 2),
            "by_category": [
                {"category": cat, "total": round(tot, 2)} for cat, tot in by_category
            ],
            "by_sub_category": [
                {"sub_category": sub, "total": round(tot, 2)}
                for sub, tot in by_sub_category
            ],
        }
