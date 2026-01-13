import aiosqlite
import json
from datetime import datetime
from typing import List, Optional
import uuid

DATABASE_PATH = "text_generator.db"


async def init_db():
    """データベースの初期化"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # ツール定義テーブル
        await db.execute("""
            CREATE TABLE IF NOT EXISTS tools (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                llm_model TEXT NOT NULL,
                system_prompt TEXT NOT NULL,
                user_prompt_template TEXT NOT NULL,
                output_format TEXT,
                input_fields TEXT NOT NULL,
                is_template INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        
        # 生成履歴テーブル
        await db.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id TEXT PRIMARY KEY,
                tool_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                inputs TEXT NOT NULL,
                output TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (tool_id) REFERENCES tools (id)
            )
        """)
        
        await db.commit()
        
        # 初期テンプレートの挿入
        await insert_default_templates(db)


async def insert_default_templates(db):
    """初期搭載テンプレートの挿入"""
    cursor = await db.execute("SELECT COUNT(*) FROM tools WHERE is_template = 1")
    count = await cursor.fetchone()
    
    if count[0] > 0:
        return
    
    templates = [
        {
            "id": str(uuid.uuid4()),
            "name": "SEO記事生成ツール",
            "description": "SEOに最適化された記事を生成します",
            "category": "記事作成",
            "llm_model": "gemini-2.0-flash",
            "system_prompt": "あなたはSEOに精通したプロのWebライターです。検索エンジンに最適化され、読者にとって価値のある記事を作成してください。",
            "user_prompt_template": """以下の条件でSEO記事を作成してください。

【キーワード】
{{keyword}}

【ターゲット読者】
{{target_audience}}

【記事の目的】
{{purpose}}

【文字数目安】
{{word_count}}文字程度

【追加の指示】
{{additional_instructions}}""",
            "output_format": "Markdown形式で出力",
            "input_fields": json.dumps([
                {"id": "keyword", "name": "キーワード", "input_type": "text_short", "required": True, "placeholder": "例: ダイエット 食事制限"},
                {"id": "target_audience", "name": "ターゲット読者", "input_type": "text_short", "required": True, "placeholder": "例: 30代女性"},
                {"id": "purpose", "name": "記事の目的", "input_type": "select", "required": True, "options": ["情報提供", "商品紹介", "ハウツー", "比較検討"]},
                {"id": "word_count", "name": "文字数目安", "input_type": "select", "required": True, "options": ["1000", "2000", "3000", "5000"]},
                {"id": "additional_instructions", "name": "追加の指示", "input_type": "text_long", "required": False, "placeholder": "その他の要望があれば入力"}
            ]),
            "is_template": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "記事リライトツール",
            "description": "既存の記事をリライトして新しい記事を生成します",
            "category": "リライト",
            "llm_model": "gemini-2.0-flash",
            "system_prompt": "あなたはプロの編集者です。与えられた文章を、オリジナリティを保ちながら読みやすくリライトしてください。",
            "user_prompt_template": """以下の文章をリライトしてください。

【元の文章】
{{original_text}}

【リライトの方向性】
{{direction}}

【トーン】
{{tone}}

【追加の指示】
{{additional_instructions}}""",
            "output_format": "Markdown形式で出力",
            "input_fields": json.dumps([
                {"id": "original_text", "name": "元の文章", "input_type": "text_long", "required": True, "placeholder": "リライトしたい文章を入力"},
                {"id": "direction", "name": "リライトの方向性", "input_type": "select", "required": True, "options": ["より簡潔に", "より詳細に", "より専門的に", "より親しみやすく"]},
                {"id": "tone", "name": "トーン", "input_type": "select", "required": True, "options": ["フォーマル", "カジュアル", "ビジネス", "親しみやすい"]},
                {"id": "additional_instructions", "name": "追加の指示", "input_type": "text_long", "required": False}
            ]),
            "is_template": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "YouTube台本生成ツール",
            "description": "YouTube動画用の台本を生成します",
            "category": "台本",
            "llm_model": "gemini-2.0-flash",
            "system_prompt": "あなたはYouTubeクリエイターのための台本ライターです。視聴者を引き付け、最後まで見てもらえる魅力的な台本を作成してください。",
            "user_prompt_template": """以下の条件でYouTube動画の台本を作成してください。

【動画のテーマ】
{{theme}}

【動画の長さ】
{{duration}}分程度

【ターゲット視聴者】
{{target_viewer}}

【動画のスタイル】
{{style}}

【含めたいポイント】
{{key_points}}""",
            "output_format": "台本形式（セリフ・演出指示を含む）",
            "input_fields": json.dumps([
                {"id": "theme", "name": "動画のテーマ", "input_type": "text_short", "required": True, "placeholder": "例: 朝のルーティン紹介"},
                {"id": "duration", "name": "動画の長さ（分）", "input_type": "select", "required": True, "options": ["3", "5", "10", "15", "20"]},
                {"id": "target_viewer", "name": "ターゲット視聴者", "input_type": "text_short", "required": True, "placeholder": "例: 20代社会人"},
                {"id": "style", "name": "動画のスタイル", "input_type": "select", "required": True, "options": ["解説系", "Vlog系", "エンタメ系", "教育系"]},
                {"id": "key_points", "name": "含めたいポイント", "input_type": "text_long", "required": False, "placeholder": "必ず含めたい内容があれば入力"}
            ]),
            "is_template": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "SNS投稿文生成ツール",
            "description": "Twitter/Instagram/Facebook用の投稿文を生成します",
            "category": "SNS",
            "llm_model": "gemini-2.0-flash",
            "system_prompt": "あなたはSNSマーケティングの専門家です。エンゲージメントを高める魅力的な投稿文を作成してください。",
            "user_prompt_template": """以下の条件でSNS投稿文を作成してください。

【プラットフォーム】
{{platform}}

【投稿の目的】
{{purpose}}

【伝えたい内容】
{{content}}

【トーン】
{{tone}}

【ハッシュタグを含める】
{{include_hashtags}}""",
            "output_format": "投稿文（必要に応じてハッシュタグ付き）",
            "input_fields": json.dumps([
                {"id": "platform", "name": "プラットフォーム", "input_type": "select", "required": True, "options": ["Twitter/X", "Instagram", "Facebook", "LinkedIn"]},
                {"id": "purpose", "name": "投稿の目的", "input_type": "select", "required": True, "options": ["告知・宣伝", "情報共有", "エンゲージメント獲得", "ブランディング"]},
                {"id": "content", "name": "伝えたい内容", "input_type": "text_long", "required": True, "placeholder": "投稿で伝えたいことを入力"},
                {"id": "tone", "name": "トーン", "input_type": "select", "required": True, "options": ["カジュアル", "フォーマル", "ユーモラス", "インスピレーショナル"]},
                {"id": "include_hashtags", "name": "ハッシュタグを含める", "input_type": "checkbox", "required": False}
            ]),
            "is_template": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "メール文章生成ツール",
            "description": "ビジネスメールの文章を生成します",
            "category": "メール",
            "llm_model": "gemini-2.0-flash",
            "system_prompt": "あなたはビジネスコミュニケーションの専門家です。適切な敬語と構成で、目的を達成するメール文章を作成してください。",
            "user_prompt_template": """以下の条件でメール文章を作成してください。

【メールの種類】
{{email_type}}

【宛先との関係】
{{relationship}}

【用件】
{{subject}}

【詳細内容】
{{details}}

【希望するアクション】
{{call_to_action}}""",
            "output_format": "メール形式（件名・本文）",
            "input_fields": json.dumps([
                {"id": "email_type", "name": "メールの種類", "input_type": "select", "required": True, "options": ["依頼", "お礼", "謝罪", "報告", "問い合わせ", "営業"]},
                {"id": "relationship", "name": "宛先との関係", "input_type": "select", "required": True, "options": ["社内上司", "社内同僚", "社外取引先", "新規顧客", "その他"]},
                {"id": "subject", "name": "用件", "input_type": "text_short", "required": True, "placeholder": "例: 打ち合わせ日程の調整"},
                {"id": "details", "name": "詳細内容", "input_type": "text_long", "required": True, "placeholder": "メールに含めたい詳細を入力"},
                {"id": "call_to_action", "name": "希望するアクション", "input_type": "text_short", "required": False, "placeholder": "例: 返信をいただきたい"}
            ]),
            "is_template": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    for template in templates:
        await db.execute("""
            INSERT INTO tools (id, name, description, category, llm_model, system_prompt, 
                             user_prompt_template, output_format, input_fields, is_template, 
                             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            template["id"], template["name"], template["description"], template["category"],
            template["llm_model"], template["system_prompt"], template["user_prompt_template"],
            template["output_format"], template["input_fields"], template["is_template"],
            template["created_at"], template["updated_at"]
        ))
    
    await db.commit()


async def get_all_tools() -> List[dict]:
    """全ツールを取得"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM tools ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_tool_by_id(tool_id: str) -> Optional[dict]:
    """IDでツールを取得"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM tools WHERE id = ?", (tool_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None


async def create_tool(tool_data: dict) -> str:
    """ツールを作成"""
    tool_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            INSERT INTO tools (id, name, description, category, llm_model, system_prompt,
                             user_prompt_template, output_format, input_fields, is_template,
                             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tool_id, tool_data["name"], tool_data["description"], tool_data["category"],
            tool_data["llm_model"], tool_data["system_prompt"], tool_data["user_prompt_template"],
            tool_data.get("output_format"), json.dumps(tool_data["input_fields"]), 0,
            now, now
        ))
        await db.commit()
    
    return tool_id


async def update_tool(tool_id: str, tool_data: dict) -> bool:
    """ツールを更新"""
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            UPDATE tools SET name = ?, description = ?, category = ?, llm_model = ?,
                           system_prompt = ?, user_prompt_template = ?, output_format = ?,
                           input_fields = ?, updated_at = ?
            WHERE id = ?
        """, (
            tool_data["name"], tool_data["description"], tool_data["category"],
            tool_data["llm_model"], tool_data["system_prompt"], tool_data["user_prompt_template"],
            tool_data.get("output_format"), json.dumps(tool_data["input_fields"]),
            now, tool_id
        ))
        await db.commit()
    
    return True


async def delete_tool(tool_id: str) -> bool:
    """ツールを削除"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("DELETE FROM tools WHERE id = ?", (tool_id,))
        await db.commit()
    
    return True


async def save_history(tool_id: str, tool_name: str, inputs: dict, output: str) -> str:
    """履歴を保存"""
    history_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            INSERT INTO history (id, tool_id, tool_name, inputs, output, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (history_id, tool_id, tool_name, json.dumps(inputs), output, now))
        await db.commit()
    
    return history_id


async def get_history(limit: int = 50, search: Optional[str] = None) -> List[dict]:
    """履歴を取得"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        if search:
            cursor = await db.execute("""
                SELECT * FROM history 
                WHERE tool_name LIKE ? OR output LIKE ?
                ORDER BY created_at DESC LIMIT ?
            """, (f"%{search}%", f"%{search}%", limit))
        else:
            cursor = await db.execute(
                "SELECT * FROM history ORDER BY created_at DESC LIMIT ?", (limit,)
            )
        
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def delete_history(history_id: str) -> bool:
    """履歴を削除"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("DELETE FROM history WHERE id = ?", (history_id,))
        await db.commit()
    
    return True
