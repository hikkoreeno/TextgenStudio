import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import ReactMarkdown from 'react-markdown'
import { 
  Search, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check,
  Clock,
  FileText,
  ExternalLink
} from 'lucide-react'

export default function HistoryPage() {
  const { history, fetchHistory, deleteHistory, isLoading } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchHistory(searchQuery || null)
  }

  const handleDelete = async (historyId) => {
    if (window.confirm('この履歴を削除しますか？')) {
      await deleteHistory(historyId)
    }
  }

  const handleCopy = async (id, text) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold">生成履歴</h1>
        <p className="text-surface-400 mt-1">過去の生成結果を確認・管理</p>
      </div>

      {/* 検索 */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
          <input
            type="text"
            placeholder="履歴を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-900 border border-surface-800 rounded-xl text-surface-100 placeholder-surface-500 focus:border-primary-500/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-primary-500/20 hover:bg-primary-500/30 rounded-xl text-primary-300 font-medium transition-colors"
        >
          検索
        </button>
      </form>

      {/* 履歴一覧 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-surface-700 border-t-primary-500 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-surface-900/30 border border-surface-800 border-dashed rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-medium text-surface-300 mb-2">
            履歴がありません
          </h3>
          <p className="text-surface-500 mb-4">
            テキストを生成すると、ここに履歴が表示されます
          </p>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500/20 hover:bg-primary-500/30 rounded-xl text-primary-300 font-medium transition-colors"
          >
            <FileText className="w-5 h-5" />
            ツール一覧へ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-surface-900/50 border border-surface-800 rounded-2xl overflow-hidden"
            >
              {/* ヘッダー部分 */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-800/30 transition-colors"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-surface-100">{item.tool_name}</h3>
                    <p className="text-sm text-surface-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/generate/${item.tool_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-surface-500 hover:text-primary-400 hover:bg-surface-800 transition-colors"
                    title="このツールを使用"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(item.id, item.output) }}
                    className="p-2 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                    title="コピー"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                    className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-surface-800 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-surface-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-surface-500" />
                  )}
                </div>
              </div>

              {/* 展開部分 */}
              {expandedId === item.id && (
                <div className="border-t border-surface-800 p-4 animate-slide-up">
                  {/* 入力内容 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-surface-400 mb-2">入力内容</h4>
                    <div className="bg-surface-800/50 rounded-xl p-3 space-y-2">
                      {Object.entries(item.inputs).map(([key, value]) => (
                        <div key={key} className="flex gap-2 text-sm">
                          <span className="text-surface-500 font-medium">{key}:</span>
                          <span className="text-surface-300">
                            {typeof value === 'boolean' ? (value ? 'はい' : 'いいえ') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 出力結果 */}
                  <div>
                    <h4 className="text-sm font-medium text-surface-400 mb-2">出力結果</h4>
                    <div className="markdown-content bg-surface-800/50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                      <ReactMarkdown>{item.output}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
