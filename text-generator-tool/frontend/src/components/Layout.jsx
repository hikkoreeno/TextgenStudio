import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Wrench, 
  History, 
  Settings, 
  Sparkles,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: Home, label: 'ホーム' },
  { path: '/tools', icon: Wrench, label: 'ツール管理' },
  { path: '/history', icon: History, label: '履歴' },
  { path: '/settings', icon: Settings, label: '設定' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold gradient-text hidden sm:block">
                TextGen Studio
              </span>
            </Link>

            {/* デスクトップナビ */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path || 
                  (path !== '/' && location.pathname.startsWith(path))
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* モバイルメニューボタン */}
            <button
              className="md:hidden p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-800 bg-surface-900/95 backdrop-blur-xl animate-slide-up">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-surface-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-surface-500 text-sm">
            © 2026 TextGen Studio - LLMベースのテキスト生成ツール
          </p>
        </div>
      </footer>
    </div>
  )
}
