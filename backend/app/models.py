from sqlalchemy import Boolean, Column, Date, Float, Integer, String

from .database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False)
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    is_recurring = Column(Boolean, default=False)
