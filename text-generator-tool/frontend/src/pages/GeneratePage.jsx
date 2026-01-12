import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import ReactMarkdown from 'react-markdown'
import { 
  ArrowLeft, 
  Play, 
  Copy, 
  RefreshCw, 
  Check,
  Loader2,
  AlertCircle,
  Edit,
  ChevronDown
} from 'lucide-react'

export default function GeneratePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    fetchTool, 
    currentTool, 
    generate, 
    generatedOutput, 
    isGenerating, 
    clearOutput,
    apiKeyConfigured,
    error
  } = useStore()

  const [inputs, setInputs] = useState({})
  const [copied, setCopied] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    loadTool()
    return () => clearOutput()
  }, [id])

  useEffect(() => {
    if (currentTool?.input_fields) {
      const initialInputs = {}
      currentTool.input_fields.forEach(field => {
        if (field.input_type === 'checkbox') {
          initialInputs[field.id] = false
        } else if (field.input_type === 'select' && field.options?.length > 0) {
          initialInputs[field.id] = field.options[0]
        } else {
          initialInputs[field.id] = ''
        }
      })
      setInputs(initialInputs)
    }
  }, [currentTool])

  const loadTool = async () => {
    await fetchTool(id)
  }

  const handleInputChange = (fieldId, value) => {
    setInputs(prev => ({ ...prev, [fieldId]: value }))
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => ({ ...prev, [fieldId]: null }))
    }
  }

  const validate = () => {
    const errors = {}
    currentTool?.input_fields?.forEach(field => {
      if (field.required && !inputs[field.id]) {
        errors[field.id] = '必須項目です'
      }
    })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGenerate = async () => {
    if (!validate()) return
    await generate(id, inputs)
  }

  const handleCopy = async () => {
    if (generatedOutput) {
      await navigator.clipboard.writeText(generatedOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = async () => {
    clearOutput()
    await generate(id, inputs)
  }

  const renderInputField = (field) => {
    const hasError = validationErrors[field.id]

    switch (field.input_type) {
      case 'text_short':
        return (
          <input
            type="text"
            value={inputs[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500 transition-colors ${
              hasError ? 'border-red-500' : 'border-surface-700 focus:border-primary-500/50'
            }`}
          />
        )

      case 'text_long':
        return (
          <textarea
            value={inputs[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500 resize-none transition-colors ${
              hasError ? 'border-red-500' : 'border-surface-700 focus:border-primary-500/50'
            }`}
          />
        )

      case 'select':
        return (
          <div className="relative">
            <select
              value={inputs[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-surface-100 appearance-none cursor-pointer transition-colors ${
                hasError ? 'border-red-500' : 'border-surface-700 focus:border-primary-500/50'
              }`}
            >
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
          </div>
        )

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs[field.id] || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="w-5 h-5 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500/50"
            />
            <span className="text-surface-300">{field.placeholder || '有効にする'}</span>
          </label>
        )

      default:
        return null
    }
  }

  if (!currentTool) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{currentTool.name}</h1>
            <p className="text-surface-400 mt-1">{currentTool.description}</p>
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-surface-800 text-surface-400">
              {currentTool.category}
            </span>
          </div>
        </div>
        <Link
          to={`/tools/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-surface-800 hover:bg-surface-700 rounded-xl text-surface-300 text-sm font-medium transition-colors"
        >
          <Edit className="w-4 h-4" />
          編集
        </Link>
      </div>

      {/* APIキー警告 */}
      {!apiKeyConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium">APIキーが設定されていません</p>
            <p className="text-sm text-amber-200/70 mt-1">
              テキスト生成を利用するには、
              <Link to="/settings" className="underline hover:text-amber-200">設定ページ</Link>
              でGemini APIキーを設定してください。
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 入力フォーム */}
        <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">入力</h2>
          <div className="space-y-4">
            {currentTool.input_fields?.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  {field.name}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-xs text-surface-500 mb-2">{field.description}</p>
                )}
                {renderInputField(field)}
                {validationErrors[field.id] && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors[field.id]}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !apiKeyConfigured}
            className="btn-glow w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                生成する
              </>
            )}
          </button>
        </div>

        {/* 出力結果 */}
        <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">出力結果</h2>
            {generatedOutput && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg text-surface-300 text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  再生成
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg text-surface-300 text-sm transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      コピー
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-surface-700 border-t-primary-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse-soft" />
                </div>
              </div>
              <p className="text-surface-400 mt-4">AIがテキストを生成しています...</p>
            </div>
          ) : generatedOutput ? (
            <div className="markdown-content bg-surface-800/50 rounded-xl p-4 max-h-[600px] overflow-y-auto">
              <ReactMarkdown>{generatedOutput}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-surface-600" />
              </div>
              <p className="text-surface-500">
                入力項目を入力して「生成する」ボタンを<br />クリックしてください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
