from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from dotenv import load_dotenv

from database import (
    init_db, get_all_tools, get_tool_by_id, create_tool, 
    update_tool, delete_tool, save_history, get_history, delete_history
)
from llm_service import llm_service

load_dotenv()

app = FastAPI(title="テキスト生成ツール API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# リクエスト/レスポンスモデル
class ToolCreate(BaseModel):
    name: str
    description: str
    category: str
    llm_model: str = "gemini-1.5-flash"
    system_prompt: str
    user_prompt_template: str
    output_format: Optional[str] = None
    input_fields: List[dict]


class GenerateRequest(BaseModel):
    tool_id: str
    inputs: dict


class ApiKeyRequest(BaseModel):
    api_key: str


# グローバル変数でAPIキー状態を管理
api_key_configured = False


@app.on_event("startup")
async def startup():
    """アプリケーション起動時の処理"""
    await init_db()
    
    # 環境変数からAPIキーを読み込み
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        llm_service.initialize(api_key)
        global api_key_configured
        api_key_configured = True


@app.get("/")
async def root():
    return {"message": "テキスト生成ツール API"}


@app.get("/api/status")
async def get_status():
    """API状態を取得"""
    return {
        "api_key_configured": api_key_configured,
        "message": "APIキーが設定されています" if api_key_configured else "APIキーを設定してください"
    }


@app.post("/api/config/api-key")
async def set_api_key(request: ApiKeyRequest):
    """APIキーを設定"""
    try:
        llm_service.initialize(request.api_key)
        global api_key_configured
        api_key_configured = True
        return {"success": True, "message": "APIキーを設定しました"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ツール関連API
@app.get("/api/tools")
async def list_tools():
    """全ツールを取得"""
    tools = await get_all_tools()
    # input_fieldsをパース
    for tool in tools:
        if isinstance(tool["input_fields"], str):
            tool["input_fields"] = json.loads(tool["input_fields"])
    return {"tools": tools}


@app.get("/api/tools/{tool_id}")
async def get_tool(tool_id: str):
    """ツールを取得"""
    tool = await get_tool_by_id(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="ツールが見つかりません")
    
    if isinstance(tool["input_fields"], str):
        tool["input_fields"] = json.loads(tool["input_fields"])
    
    return {"tool": tool}


@app.post("/api/tools")
async def create_new_tool(tool: ToolCreate):
    """ツールを作成"""
    tool_data = tool.model_dump()
    tool_id = await create_tool(tool_data)
    return {"success": True, "tool_id": tool_id}


@app.put("/api/tools/{tool_id}")
async def update_existing_tool(tool_id: str, tool: ToolCreate):
    """ツールを更新"""
    existing = await get_tool_by_id(tool_id)
    if not existing:
        raise HTTPException(status_code=404, detail="ツールが見つかりません")
    
    tool_data = tool.model_dump()
    await update_tool(tool_id, tool_data)
    return {"success": True}


@app.delete("/api/tools/{tool_id}")
async def delete_existing_tool(tool_id: str):
    """ツールを削除"""
    existing = await get_tool_by_id(tool_id)
    if not existing:
        raise HTTPException(status_code=404, detail="ツールが見つかりません")
    
    await delete_tool(tool_id)
    return {"success": True}


@app.post("/api/tools/{tool_id}/duplicate")
async def duplicate_tool(tool_id: str):
    """ツールを複製"""
    tool = await get_tool_by_id(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="ツールが見つかりません")
    
    # input_fieldsをパース
    input_fields = tool["input_fields"]
    if isinstance(input_fields, str):
        input_fields = json.loads(input_fields)
    
    new_tool_data = {
        "name": f"{tool['name']} (コピー)",
        "description": tool["description"],
        "category": tool["category"],
        "llm_model": tool["llm_model"],
        "system_prompt": tool["system_prompt"],
        "user_prompt_template": tool["user_prompt_template"],
        "output_format": tool["output_format"],
        "input_fields": input_fields
    }
    
    new_tool_id = await create_tool(new_tool_data)
    return {"success": True, "tool_id": new_tool_id}


# 生成API
@app.post("/api/generate")
async def generate_text(request: GenerateRequest):
    """テキストを生成"""
    if not api_key_configured:
        raise HTTPException(status_code=400, detail="APIキーが設定されていません")
    
    tool = await get_tool_by_id(request.tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="ツールが見つかりません")
    
    try:
        output = await llm_service.generate(
            system_prompt=tool["system_prompt"],
            user_prompt_template=tool["user_prompt_template"],
            inputs=request.inputs,
            model=tool["llm_model"],
            output_format=tool["output_format"]
        )
        
        # 履歴を保存
        history_id = await save_history(
            tool_id=request.tool_id,
            tool_name=tool["name"],
            inputs=request.inputs,
            output=output
        )
        
        return {
            "success": True,
            "output": output,
            "history_id": history_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 履歴API
@app.get("/api/history")
async def list_history(limit: int = 50, search: Optional[str] = None):
    """履歴を取得"""
    history = await get_history(limit=limit, search=search)
    
    # inputsをパース
    for item in history:
        if isinstance(item["inputs"], str):
            item["inputs"] = json.loads(item["inputs"])
    
    return {"history": history}


@app.delete("/api/history/{history_id}")
async def delete_history_item(history_id: str):
    """履歴を削除"""
    await delete_history(history_id)
    return {"success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
