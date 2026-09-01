from typing import List, Optional

from pydantic import BaseModel, Field


class ReceiptLine(BaseModel):
    text: str
    confidence: float = 0.0
    bbox: list = Field(default_factory=list)


class ReceiptExtraction(BaseModel):
    merchantName: str = "Unknown Merchant"
    merchantAddress: Optional[str] = None
    transactionDate: str
    transactionTime: Optional[str] = None
    subtotal: Optional[float] = None
    taxAmount: Optional[float] = None
    tipAmount: Optional[float] = None
    totalAmount: float = 0.0
    previousBalance: Optional[float] = None
    balanceDue: Optional[float] = None
    currency: str = "USD"
    referenceNumber: Optional[str] = None
    paymentMethod: Optional[str] = None
    lastFourDigits: Optional[str] = None
    cardBrand: Optional[str] = None
    category: str = "Other"
    items: List[dict] = Field(default_factory=list)
    confidence: float = 0.0
    rawText: Optional[str] = None
    parserSource: str = "tesseract"

    class Config:
        extra = "ignore"
