# テキスト生成ツール（LLMベース）

業務特化型のテキスト生成ツールを定義・登録し、LLMを用いて記事生成・リライト・台本作成などを効率化するシステムです。

## 機能

- **ツール定義機能**: 独自のテキスト生成ツールを作成・保存
- **入力項目の柔軟な設計**: テキスト、セレクトボックス、チェックボックスなど
- **テキスト生成実行**: LLM APIを呼び出して結果を生成
- **初期搭載テンプレート**: SEO記事、リライト、YouTube台本、SNS投稿、メール文章
- **履歴管理**: 生成履歴の保存・検索・削除

## セットアップ

### バックエンド

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

`.env`ファイルを作成:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

起動:
```bash
uvicorn main:app --reload --port 8000
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

## 技術スタック

- **フロントエンド**: React + Vite + Tailwind CSS
- **バックエンド**: FastAPI (Python)
- **LLM**: Google Gemini (gemini-1.5-flash / gemini-1.5-pro / gemini-1.0-pro)
- **データベース**: SQLite (aiosqlite)

## ディレクトリ構造

```
text-generator-tool/
├── backend/
│   ├── main.py           # FastAPIアプリケーション
│   ├── database.py       # データベース設定
│   ├── models.py         # Pydanticモデル
│   ├── llm_service.py    # LLM統合サービス
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Reactコンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── store/        # Zustand状態管理
│   │   └── App.jsx
│   ├── package.json
│   └── index.html
└── README.md
```
