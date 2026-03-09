import csv
import re
from datetime import date
from pathlib import Path

from .database import SessionLocal, engine
from .models import Base, Expense

CSV_PATH = Path(__file__).resolve().parent.parent.parent / "Dinero.csv"


def parse_amount(raw: str) -> float | None:
    if not raw or not raw.strip():
        return None
    cleaned = raw.replace("₹", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_date(raw: str, year: int = 2025) -> date | None:
    raw = raw.strip()
    if not raw:
        return None
    match = re.match(r"([A-Za-z]+)\s+(\d+)", raw)
    if not match:
        return None
    month_str, day_str = match.groups()
    month_map = {
        "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
        "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
    }
    month = month_map.get(month_str)
    if month is None:
        return None
    return date(year, month, int(day_str))


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data
    db.query(Expense).delete()
    db.commit()

    current_date = None

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # skip header

        for row in reader:
            if len(row) < 8:
                continue

            raw_date, category, sub_category, description, amount_str = (
                row[0], row[1], row[2], row[3], row[4],
            )
            is_recurring_str = row[7]

            # Track the current date (rows without dates inherit from previous)
            parsed_date = parse_date(raw_date)
            if parsed_date:
                current_date = parsed_date

            if not current_date:
                continue

            amount = parse_amount(amount_str)
            if amount is None or not description.strip():
                continue

            category = category.strip()
            sub_category = sub_category.strip()
            if not category or not sub_category:
                continue

            is_recurring = is_recurring_str.strip().lower() == "yes"

            expense = Expense(
                date=current_date,
                category=category,
                sub_category=sub_category,
                description=description.strip(),
                amount=amount,
                is_recurring=is_recurring,
            )
            db.add(expense)

    db.commit()
    count = db.query(Expense).count()
    print(f"Seeded {count} expenses into the database.")
    db.close()


if __name__ == "__main__":
    seed_database()
