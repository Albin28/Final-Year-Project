from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    quantity_in_stock: int = 0
    reorder_level: int = 10

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity_in_stock: Optional[int] = None
    reorder_level: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True


# --- POS / Billing Schemas ---
class BillItemCreate(BaseModel):
    product_id: int
    quantity: int


class BillCreate(BaseModel):
    items: list[BillItemCreate]


class BillItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


class BillResponse(BaseModel):
    id: int
    total_amount: float
    created_at: datetime
    items: list[BillItemResponse]

    class Config:
        from_attributes = True


class BillSummaryResponse(BaseModel):
    id: int
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True
