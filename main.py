from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, database

#1. データベースのテーブルを作成
models.Base.metadata.create_all(bind=database.engine)

app=FastAPI()

#2. データベースセッションを取得する関数
def get_db():
    db=database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

#3. API(Application Programming Interface)エンドポイントの設定
@app.get("/books")
def get_books(db: Session=Depends(get_db)):
    """データベースからすべての本を取得"""
    return db.query(models.Book).all()

@app.post("/books")
def create_books(title: str, reason: str, db: Session = Depends(get_db)):
    """新しい本を追加する"""
    new_book=models.Book(title=title, reason=reason, status="unread")
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book
