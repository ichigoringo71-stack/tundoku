from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#1. データベースファイルの保存場所を指定（backendフォルダ内に test.db が作られます）
SQLALCHEMY_DATABASE_URL="sqlite:///./test.db"

#2. データベースエンジンを作成
engine=create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

#3. データベース操作のための「セッション」を作成
SessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)

#4. データの設計図を作るためのベースクラス
Base=declarative_base()