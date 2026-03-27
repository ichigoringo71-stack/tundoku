from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app=FastAPI()

#1. データの形を定義
class Book(BaseModel):
    id: int
    title: str
    reason: str
    status: str # 'unread', 'reading', 'completed'
    review: Optional[str]=None

#2. 仮のデータベースをメモリ上に保存
books_db: List[Book]=[
    Book(id=1, title="三体", reason="SFが好きだから", status="reading"),
    Book(id=2, title="ファスト＆スロー", reason="心理学に興味がある", status="unread"),
]

#3. API(Application Programming Interface)エンドポイントの設定
@app.get("/")
def home():
    return{"message": "tundoku API稼働中"}

@app.get("/books", response_model=List[Book])
def get_all_books():
    """全ての本を取得する"""
    return books_db

@app.post("/books")
def create_books(book: Book):
    """新しい本を追加する"""
    books_db.append(book)
    return{"massage": f"[{book.title}]を追加しました", "book": book}
