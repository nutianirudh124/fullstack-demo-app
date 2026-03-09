from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..repository import ExpenseRepository
from ..schemas import ExpenseCreate, ExpenseResponse, ExpenseSummary, ExpenseUpdate
from ..seed import seed_database

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


def get_repo(db: Session = Depends(get_db)) -> ExpenseRepository:
    return ExpenseRepository(db)


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    category: str | None = None,
    sub_category: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    repo: ExpenseRepository = Depends(get_repo),
):
    return repo.get_all(category, sub_category, start_date, end_date)


@router.get("/summary", response_model=ExpenseSummary)
def get_summary(repo: ExpenseRepository = Depends(get_repo)):
    return repo.get_summary()


@router.post("", response_model=ExpenseResponse, status_code=201)
def create_expense(
    data: ExpenseCreate, repo: ExpenseRepository = Depends(get_repo)
):
    return repo.create(data)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    repo: ExpenseRepository = Depends(get_repo),
):
    expense = repo.update(expense_id, data)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int, repo: ExpenseRepository = Depends(get_repo)
):
    if not repo.delete(expense_id):
        raise HTTPException(status_code=404, detail="Expense not found")


@router.post("/seed", status_code=200)
def seed_data():
    seed_database()
    return {"message": "Database seeded successfully"}
