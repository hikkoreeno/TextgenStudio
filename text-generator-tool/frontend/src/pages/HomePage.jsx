import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  RefreshCw, 
  Video, 
  MessageSquare, 
  Mail,
  Plus,
  Zap,
  Shield,
  Layers
} from 'lucide-react'

const categoryIcons = {
  '記事作成': FileText,
  'リライト': RefreshCw,
  '台本': Video,
  'SNS': MessageSquare,
  'メール': Mail,
}

const features = [
  {
    icon: Zap,
    title: '高速生成',
    description: 'LLMを活用した高品質なテキストを数秒で生成'
  },
  {
    icon: Layers,
    title: 'カスタマイズ可能',
    description: '独自のプロンプトと入力項目でツールを自由に設計'
  },
  {
    icon: Shield,
    title: 'セキュア',
    description: 'APIキーの安全管理とデータの暗号化'
  }
]

export default function HomePage() {
  const { tools, apiKeyConfigured } = useStore()
  
  const templateTools = tools.filter(t => t.is_template)
  const userTools = tools.filter(t => !t.is_template)

  return (
    <div className="space-y-12 animate-fade-in">
      {/* ヒーローセクション */}
      <section className="text-center py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent rounded-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>LLMベースのテキスト生成</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">TextGen Studio</span>
          </h1>
          <p className="text-xl text-surface-400 max-w-2xl mx-auto mb-8">
            業務特化型のテキスト生成ツールを定義・登録し、<br className="hidden sm:block" />
            記事作成・リライト・台本作成を効率化
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/tools/new"
              className="btn-glow inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all"
            >
              <Plus className="w-5 h-5" />
              新規ツール作成
            </Link>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-800 hover:bg-surface-700 rounded-xl text-surface-200 font-medium transition-all"
            >
              ツール一覧を見る
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* APIキー警告 */}
      {!apiKeyConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-medium text-amber-300 mb-1">APIキーが設定されていません</h3>
            <p className="text-sm text-amber-200/70 mb-2">
              テキスト生成を利用するには、Gemini APIキーの設定が必要です。
            </p>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1 text-sm text-amber-300 hover:text-amber-200"
            >
              設定ページへ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 特徴 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">特徴</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="card-hover bg-surface-900/50 border border-surface-800 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-surface-400 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* テンプレートツール */}
      {templateTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">テンプレートツール</h2>
            <Link
              to="/tools"
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
            >
              すべて見る
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateTools.slice(0, 6).map((tool, index) => {
              const Icon = categoryIcons[tool.category] || FileText
              return (
                <Link
                  key={tool.id}
                  to={`/generate/${tool.id}`}
                  className="card-hover group bg-surface-900/50 border border-surface-800 rounded-2xl p-5 block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary-500/30 group-hover:to-accent-500/30 transition-all">
                      <Icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-100 mb-1 truncate group-hover:text-primary-300 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-surface-500 line-clamp-2">
                        {tool.description}
                      </p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-surface-800 text-surface-400">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ユーザーツール */}
      {userTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">マイツール</h2>
            <Link
              to="/tools/new"
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              新規作成
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTools.slice(0, 6).map((tool, index) => {
              const Icon = categoryIcons[tool.category] || FileText
              return (
                <Link
                  key={tool.id}
                  to={`/generate/${tool.id}`}
                  className="card-hover group bg-surface-900/50 border border-surface-800 rounded-2xl p-5 block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-accent-500/30 group-hover:to-primary-500/30 transition-all">
                      <Icon className="w-5 h-5 text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-100 mb-1 truncate group-hover:text-accent-300 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-surface-500 line-clamp-2">
                        {tool.description}
                      </p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-surface-800 text-surface-400">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
