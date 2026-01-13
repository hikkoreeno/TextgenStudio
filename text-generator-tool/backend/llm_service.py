import google.generativeai as genai
from typing import Optional
import asyncio


class LLMService:
    def __init__(self):
        self.api_key = None
        self.initialized = False
    
    def initialize(self, api_key: str):
        """Gemini APIを初期化"""
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.initialized = True
    
    def build_user_prompt(self, template: str, inputs: dict) -> str:
        """ユーザープロンプトを構築"""
        result = template
        for key, value in inputs.items():
            placeholder = "{{" + key + "}}"
            if isinstance(value, bool):
                value = "はい" if value else "いいえ"
            elif isinstance(value, list):
                value = ", ".join(str(v) for v in value)
            result = result.replace(placeholder, str(value) if value else "")
        return result
    
    async def generate(
        self,
        system_prompt: str,
        user_prompt_template: str,
        inputs: dict,
        model: str = "gemini-2.0-flash",
        output_format: Optional[str] = None
    ) -> str:
        """テキストを生成"""
        if not self.initialized:
            raise ValueError("LLMサービスが初期化されていません。APIキーを設定してください。")
        
        user_prompt = self.build_user_prompt(user_prompt_template, inputs)
        
        if output_format:
            user_prompt += f"\n\n【出力形式】\n{output_format}"
        
        # Geminiモデルの設定
        generation_config = genai.GenerationConfig(
            temperature=0.7,
            max_output_tokens=4000,
        )
        
        # モデルを作成（システムプロンプトを設定）
        gemini_model = genai.GenerativeModel(
            model_name=model,
            generation_config=generation_config,
            system_instruction=system_prompt
        )
        
        # 非同期で生成を実行
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: gemini_model.generate_content(user_prompt)
        )
        
        return response.text


# シングルトンインスタンス
llm_service = LLMService()
