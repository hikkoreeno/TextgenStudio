from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class InputType(str, Enum):
    TEXT_SHORT = "text_short"
    TEXT_LONG = "text_long"
    SELECT = "select"
    CHECKBOX = "checkbox"


class Category(str, Enum):
    ARTICLE = "記事作成"
    REWRITE = "リライト"
    SCRIPT = "台本"
    SNS = "SNS"
    EMAIL = "メール"
    OTHER = "その他"


class LLMModel(str, Enum):
    GEMINI_20_FLASH = "gemini-2.0-flash"
    GEMINI_15_FLASH = "gemini-1.5-flash"
    GEMINI_15_PRO = "gemini-1.5-pro"


# 入力項目定義
class InputFieldDefinition(BaseModel):
    id: str
    name: str
    input_type: InputType
    required: bool = False
    placeholder: Optional[str] = None
    description: Optional[str] = None
    options: Optional[List[str]] = None  # セレクトボックス用


# ツール定義
class ToolDefinitionBase(BaseModel):
    name: str
    description: str
    category: Category
    llm_model: LLMModel = LLMModel.GEMINI_15_FLASH
    system_prompt: str
    user_prompt_template: str
    output_format: Optional[str] = None
    input_fields: List[InputFieldDefinition]


class ToolDefinitionCreate(ToolDefinitionBase):
    pass


class ToolDefinition(ToolDefinitionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_template: bool = False


# 生成リクエスト
class GenerationRequest(BaseModel):
    tool_id: str
    inputs: dict  # 入力項目名: 値


# 生成結果
class GenerationResult(BaseModel):
    id: str
    tool_id: str
    tool_name: str
    inputs: dict
    output: str
    created_at: datetime


# 履歴
class HistoryItem(BaseModel):
    id: str
    tool_id: str
    tool_name: str
    inputs: dict
    output: str
    created_at: datetime


# APIレスポンス
class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None
