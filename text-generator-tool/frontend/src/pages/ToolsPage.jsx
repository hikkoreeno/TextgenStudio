import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { 
  Plus, 
  Search, 
  FileText, 
  RefreshCw, 
  Video, 
  MessageSquare, 
  Mail,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Play,
  Sparkles
} from 'lucide-react'

const categoryIcons = {
  '記事作成': FileText,
  'リライト': RefreshCw,
  '台本': Video,
  'SNS': MessageSquare,
  'メール': Mail,
}

const categories = ['すべて', '記事作成', 'リライト', '台本', 'SNS', 'メール', 'その他']

export default function ToolsPage() {
  const navigate = useNavigate()
  const { tools, deleteTool, duplicateTool } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [activeMenu, setActiveMenu] = useState(null)

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'すべて' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const templateTools = filteredTools.filter(t => t.is_template)
  const userTools = filteredTools.filter(t => !t.is_template)

  const handleDelete = async (toolId) => {
    if (window.confirm('このツールを削除しますか？')) {
      await deleteTool(toolId)
    }
    setActiveMenu(null)
  }

  const handleDuplicate = async (toolId) => {
    await duplicateTool(toolId)
    setActiveMenu(null)
  }

  const ToolCard = ({ tool, isTemplate }) => {
    const Icon = categoryIcons[tool.category] || FileText
    return (
      <div className="card-hover group bg-surface-900/50 border border-surface-800 rounded-2xl p-5 relative">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            isTemplate 
              ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 group-hover:from-primary-500/30 group-hover:to-accent-500/30'
              : 'bg-gradient-to-br from-accent-500/20 to-primary-500/20 group-hover:from-accent-500/30 group-hover:to-primary-500/30'
          }`}>
            <Icon className={`w-5 h-5 ${isTemplate ? 'text-primary-400' : 'text-accent-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-surface-100 truncate">
                {tool.name}
              </h3>
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === tool.id ? null : tool.id)}
                  className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {activeMenu === tool.id && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-10 overflow-hidden animate-slide-in">
                    <button
                      onClick={() => { navigate(`/generate/${tool.id}`); setActiveMenu(null) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      使用する
                    </button>
                    <button
                      onClick={() => { navigate(`/tools/${tool.id}/edit`); setActiveMenu(null) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      編集
                    </button>
                    <button
                      onClick={() => handleDuplicate(tool.id)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      複製
                    </button>
                    {!isTemplate && (
                      <button
                        onClick={() => handleDelete(tool.id)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-surface-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        削除
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-surface-500 line-clamp-2 mt-1">
              {tool.description}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs px-2 py-1 rounded-full bg-surface-800 text-surface-400">
                {tool.category}
              </span>
              {isTemplate && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  テンプレート
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          to={`/generate/${tool.id}`}
          className="absolute inset-0 rounded-2xl"
          onClick={(e) => activeMenu === tool.id && e.preventDefault()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">ツール管理</h1>
          <p className="text-surface-400 mt-1">生成ツールの作成・編集・管理</p>
        </div>
        <Link
          to="/tools/new"
          className="btn-glow inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all"
        >
          <Plus className="w-5 h-5" />
          新規作成
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
          <input
            type="text"
            placeholder="ツールを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-900 border border-surface-800 rounded-xl text-surface-100 placeholder-surface-500 focus:border-primary-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-surface-800 text-surface-400 border border-transparent hover:text-surface-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* テンプレートツール */}
      {templateTools.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            テンプレートツール
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} isTemplate={true} />
            ))}
          </div>
        </section>
      )}

      {/* ユーザーツール */}
      <section>
        <h2 className="text-xl font-semibold mb-4">マイツール</h2>
        {userTools.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} isTemplate={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-900/30 border border-surface-800 border-dashed rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="text-lg font-medium text-surface-300 mb-2">
              マイツールがありません
            </h3>
            <p className="text-surface-500 mb-4">
              新しいツールを作成するか、テンプレートを複製してください
            </p>
            <Link
              to="/tools/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500/20 hover:bg-primary-500/30 rounded-xl text-primary-300 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              新規作成
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
