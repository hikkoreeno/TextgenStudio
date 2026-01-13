import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical,
  HelpCircle,
  ChevronDown
} from 'lucide-react'

const categories = ['記事作成', 'リライト', '台本', 'SNS', 'メール', 'その他']
const llmModels = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
]
const inputTypes = [
  { value: 'text_short', label: '短文テキスト' },
  { value: 'text_long', label: '長文テキスト' },
  { value: 'select', label: 'セレクトボックス' },
  { value: 'checkbox', label: 'チェックボックス' },
]

export default function ToolEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchTool, createTool, updateTool, isLoading } = useStore()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '記事作成',
    llm_model: 'gemini-2.0-flash',
    system_prompt: '',
    user_prompt_template: '',
    output_format: '',
    input_fields: []
  })

  const [errors, setErrors] = useState({})
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      loadTool()
    }
  }, [id])

  const loadTool = async () => {
    const tool = await fetchTool(id)
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description,
        category: tool.category,
        llm_model: tool.llm_model,
        system_prompt: tool.system_prompt,
        user_prompt_template: tool.user_prompt_template,
        output_format: tool.output_format || '',
        input_fields: tool.input_fields
      })
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const addInputField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: '',
      input_type: 'text_short',
      required: false,
      placeholder: '',
      description: '',
      options: []
    }
    setFormData(prev => ({
      ...prev,
      input_fields: [...prev.input_fields, newField]
    }))
  }

  const updateInputField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      input_fields: prev.input_fields.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }))
  }

  const removeInputField = (index) => {
    setFormData(prev => ({
      ...prev,
      input_fields: prev.input_fields.filter((_, i) => i !== index)
    }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'ツール名は必須です'
    if (!formData.description.trim()) newErrors.description = '説明は必須です'
    if (!formData.system_prompt.trim()) newErrors.system_prompt = 'システムプロンプトは必須です'
    if (!formData.user_prompt_template.trim()) newErrors.user_prompt_template = 'ユーザープロンプトは必須です'
    
    formData.input_fields.forEach((field, index) => {
      if (!field.name.trim()) {
        newErrors[`field_${index}_name`] = '入力項目名は必須です'
      }
      if (field.input_type === 'select' && (!field.options || field.options.length === 0)) {
        newErrors[`field_${index}_options`] = '選択肢を入力してください'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = isEditMode 
      ? await updateTool(id, formData)
      : await createTool(formData)

    if (result.success) {
      navigate('/tools')
    }
  }

  const insertVariable = (fieldId) => {
    const variable = `{{${fieldId}}}`
    const textarea = document.getElementById('user_prompt_template')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = formData.user_prompt_template.substring(0, start) + 
        variable + 
        formData.user_prompt_template.substring(end)
      handleChange('user_prompt_template', newValue)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'ツールを編集' : '新規ツール作成'}
          </h1>
          <p className="text-surface-400 text-sm mt-1">
            カスタムテキスト生成ツールを定義
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報 */}
        <section className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">基本情報</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                ツール名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例: SEO記事生成ツール"
                className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500 transition-colors ${
                  errors.name ? 'border-red-500' : 'border-surface-700 focus:border-primary-500/50'
                }`}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                説明 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="このツールの用途を説明..."
                rows={2}
                className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500 resize-none transition-colors ${
                  errors.description ? 'border-red-500' : 'border-surface-700 focus:border-primary-500/50'
                }`}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  カテゴリ
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 appearance-none cursor-pointer focus:border-primary-500/50 transition-colors"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  LLMモデル
                </label>
                <div className="relative">
                  <select
                    value={formData.llm_model}
                    onChange={(e) => handleChange('llm_model', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 appearance-none cursor-pointer focus:border-primary-500/50 transition-colors"
                  >
                    {llmModels.map(model => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 入力項目定義 */}
        <section className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">入力項目定義</h2>
            <button
              type="button"
              onClick={addInputField}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg text-primary-300 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              項目追加
            </button>
          </div>

          {formData.input_fields.length === 0 ? (
            <div className="text-center py-8 border border-surface-700 border-dashed rounded-xl">
              <p className="text-surface-500 mb-3">入力項目がありません</p>
              <button
                type="button"
                onClick={addInputField}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg text-surface-300 text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                最初の項目を追加
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.input_fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-surface-800/50 border border-surface-700 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 text-surface-600 cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 grid gap-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-surface-400 mb-1">
                            項目名（ID: {field.id}）
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateInputField(index, 'name', e.target.value)}
                            placeholder="例: キーワード"
                            className={`w-full px-3 py-2 bg-surface-900 border rounded-lg text-sm text-surface-100 placeholder-surface-500 ${
                              errors[`field_${index}_name`] ? 'border-red-500' : 'border-surface-600'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-400 mb-1">
                            入力タイプ
                          </label>
                          <select
                            value={field.input_type}
                            onChange={(e) => updateInputField(index, 'input_type', e.target.value)}
                            className="w-full px-3 py-2 bg-surface-900 border border-surface-600 rounded-lg text-sm text-surface-100"
                          >
                            {inputTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {field.input_type === 'select' && (
                        <div>
                          <label className="block text-xs font-medium text-surface-400 mb-1">
                            選択肢（カンマ区切り）
                          </label>
                          <input
                            type="text"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateInputField(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="例: オプション1, オプション2, オプション3"
                            className={`w-full px-3 py-2 bg-surface-900 border rounded-lg text-sm text-surface-100 placeholder-surface-500 ${
                              errors[`field_${index}_options`] ? 'border-red-500' : 'border-surface-600'
                            }`}
                          />
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-surface-400 mb-1">
                            プレースホルダ
                          </label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateInputField(index, 'placeholder', e.target.value)}
                            placeholder="入力例を表示..."
                            className="w-full px-3 py-2 bg-surface-900 border border-surface-600 rounded-lg text-sm text-surface-100 placeholder-surface-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateInputField(index, 'required', e.target.checked)}
                              className="w-4 h-4 rounded border-surface-600 bg-surface-900 text-primary-500 focus:ring-primary-500/50"
                            />
                            <span className="text-sm text-surface-300">必須項目</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInputField(index)}
                      className="p-2 text-surface-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* プロンプト設定 */}
        <section className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">プロンプト設定</h2>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1 text-sm text-surface-400 hover:text-surface-300"
            >
              <HelpCircle className="w-4 h-4" />
              ヘルプ
            </button>
          </div>

          {showHelp && (
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 mb-4 text-sm">
              <p className="text-primary-300 font-medium mb-2">変数の使い方</p>
              <p className="text-surface-300">
                ユーザープロンプト内で <code className="bg-surface-800 px-1.5 py-0.5 rounded text-primary-300">{'{{項目ID}}'}</code> の形式で入力項目を参照できます。
                下のボタンをクリックすると、カーソル位置に変数が挿入されます。
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                システムプロンプト <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.system_prompt}
                onChange={(e) => handleChange('system_prompt', e.target.value)}
                placeholder="例: あなたはSEOに精通したプロのWebライターです。"
                rows={4}
                className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500 font-mono text-sm resize-none transition-colors ${
                  errors.system_prompt ? 'border-red-500' : 'border-surface-700 focus:border-primary-500/50'
                }`}
              />
              {errors.system_prompt && <p className="text-red-400 text-sm mt-1">{errors.system_prompt}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                ユーザープロンプトテンプレート <span className="text-red-400">*</span>
              </label>
              {formData.input_fields.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs text-surface-500">変数を挿入:</span>
                  {formData.input_fields.map(field => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => insertVariable(field.id)}
                      className="px-2 py-1 bg-surface-800 hover:bg-surface-700 rounded text-xs text-primary-300 transition-colors"
                    >
                      {`{{${field.id}}}`}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                id="user_prompt_template"
                value={formData.user_prompt_template}
                onChange={(e) => handleChange('user_prompt_template', e.target.value)}
                placeholder={`例:\n以下の条件でSEO記事を作成してください。\n\n【キーワード】\n{{keyword}}\n\n【ターゲット読者】\n{{target}}`}
                rows={8}
                className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500 font-mono text-sm resize-none transition-colors ${
                  errors.user_prompt_template ? 'border-red-500' : 'border-surface-700 focus:border-primary-500/50'
                }`}
              />
              {errors.user_prompt_template && <p className="text-red-400 text-sm mt-1">{errors.user_prompt_template}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                出力形式指定（オプション）
              </label>
              <input
                type="text"
                value={formData.output_format}
                onChange={(e) => handleChange('output_format', e.target.value)}
                placeholder="例: Markdown形式で出力"
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:border-primary-500/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-surface-800 hover:bg-surface-700 rounded-xl text-surface-300 font-medium transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-glow flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
