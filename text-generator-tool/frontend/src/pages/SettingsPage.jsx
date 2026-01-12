import { useState } from 'react'
import { useStore } from '../store/useStore'
import { 
  Key, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Shield,
  Sparkles,
  Info,
  Gem
} from 'lucide-react'

export default function SettingsPage() {
  const { apiKeyConfigured, setApiKey } = useStore()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!apiKeyInput.trim()) {
      setMessage({ type: 'error', text: 'APIキーを入力してください' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const result = await setApiKey(apiKeyInput)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'APIキーを設定しました' })
      setApiKeyInput('')
    } else {
      setMessage({ type: 'error', text: result.error || 'エラーが発生しました' })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-surface-400 mt-1">APIキーの設定と管理</p>
      </div>

      {/* APIキー設定 */}
      <section className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Gem className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Google Gemini APIキー</h2>
            <p className="text-surface-400 text-sm mt-1">
              テキスト生成にはGemini APIキーが必要です
            </p>
          </div>
        </div>

        {/* 現在の状態 */}
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
          apiKeyConfigured 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          {apiKeyConfigured ? (
            <>
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-300">APIキーが設定されています</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300">APIキーが設定されていません</span>
            </>
          )}
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              {apiKeyConfigured ? '新しいAPIキー' : 'APIキー'}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 pr-12 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 font-mono focus:border-primary-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-300' 
                : 'bg-red-500/10 text-red-300'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-glow w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all disabled:opacity-50"
          >
            {isSubmitting ? '設定中...' : apiKeyConfigured ? 'APIキーを更新' : 'APIキーを設定'}
          </button>
        </form>
      </section>

      {/* セキュリティ情報 */}
      <section className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">セキュリティについて</h2>
            <p className="text-surface-400 text-sm mt-1">
              APIキーの取り扱いについて
            </p>
          </div>
        </div>

        <ul className="space-y-3 text-sm text-surface-400">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>APIキーはサーバーのメモリ上でのみ保持され、データベースには保存されません</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>サーバーを再起動すると、APIキーの再設定が必要です</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>本番環境では環境変数（GEMINI_API_KEY）での設定を推奨します</span>
          </li>
        </ul>
      </section>

      {/* APIキー取得方法 */}
      <section className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">APIキーの取得方法</h2>
            <p className="text-surface-400 text-sm mt-1">
              Google Gemini APIキーの取得手順
            </p>
          </div>
        </div>

        <ol className="space-y-3 text-sm text-surface-400 list-decimal list-inside">
          <li>
            <a 
              href="https://ai.google.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Google AI Studio
            </a>
            にアクセス
          </li>
          <li>Googleアカウントでログイン</li>
          <li>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              API Keys
            </a>
            ページで「Create API Key」をクリック
          </li>
          <li>生成されたキーをコピーして上記フォームに貼り付け</li>
        </ol>

        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-300">
              Gemini APIには無料枠があります。詳細は Google AI Studio で確認してください。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
