from fastapi import FastAPI, Depends, HTTPException
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

@app.delete("/books/{book_id}")
def delete_books(book_id: int, db: Session=Depends(get_db)):
    #1. データベースから該当するidの本を探す
    db_book=db.query(models.Book).filter(models.Book.id==book_id).first()
    #2. 見つからなければエラーを返す
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    
    #3. 削除してコミットする
    db.delete(db_book)
    db.commit()
    return{"message": f"ID{book_id}の本を削除しました"}

@app.patch("/books/{book_id}")
def update_book(book_id: int, status: str=None, review: str=None, db: Session=Depends(get_db)):
    db_book=db.query(models.Book).filter(models.Book.id==book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    if status:
        db_book.status=status
    if review:
        db_book.review=review

    db.commit()
    db.refresh(db_book)
    return db_book