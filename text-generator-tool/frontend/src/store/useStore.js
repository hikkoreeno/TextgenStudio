import { create } from 'zustand'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const useStore = create((set, get) => ({
  // 状態
  tools: [],
  currentTool: null,
  history: [],
  isLoading: false,
  error: null,
  apiKeyConfigured: false,
  generatedOutput: null,
  isGenerating: false,

  // ツール関連
  fetchTools: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/tools`)
      const data = await res.json()
      set({ tools: data.tools, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchTool: async (toolId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/tools/${toolId}`)
      const data = await res.json()
      set({ currentTool: data.tool, isLoading: false })
      return data.tool
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return null
    }
  },

  createTool: async (toolData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData)
      })
      const data = await res.json()
      if (data.success) {
        await get().fetchTools()
      }
      set({ isLoading: false })
      return data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  updateTool: async (toolId, toolData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData)
      })
      const data = await res.json()
      if (data.success) {
        await get().fetchTools()
      }
      set({ isLoading: false })
      return data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  deleteTool: async (toolId) => {
    try {
      const res = await fetch(`${API_BASE}/tools/${toolId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        await get().fetchTools()
      }
      return data
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  duplicateTool: async (toolId) => {
    try {
      const res = await fetch(`${API_BASE}/tools/${toolId}/duplicate`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        await get().fetchTools()
      }
      return data
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // 生成関連
  generate: async (toolId, inputs) => {
    set({ isGenerating: true, error: null, generatedOutput: null })
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: toolId, inputs })
      })
      const data = await res.json()
      if (res.ok) {
        set({ generatedOutput: data.output, isGenerating: false })
        return { success: true, output: data.output }
      } else {
        set({ error: data.detail, isGenerating: false })
        return { success: false, error: data.detail }
      }
    } catch (err) {
      set({ error: err.message, isGenerating: false })
      return { success: false, error: err.message }
    }
  },

  clearOutput: () => {
    set({ generatedOutput: null })
  },

  // 履歴関連
  fetchHistory: async (search = null) => {
    set({ isLoading: true, error: null })
    try {
      const url = search 
        ? `${API_BASE}/history?search=${encodeURIComponent(search)}`
        : `${API_BASE}/history`
      const res = await fetch(url)
      const data = await res.json()
      set({ history: data.history, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  deleteHistory: async (historyId) => {
    try {
      const res = await fetch(`${API_BASE}/history/${historyId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        await get().fetchHistory()
      }
      return data
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // API設定
  checkApiStatus: async () => {
    try {
      const res = await fetch(`${API_BASE}/status`)
      const data = await res.json()
      set({ apiKeyConfigured: data.api_key_configured })
      return data
    } catch (err) {
      return { api_key_configured: false }
    }
  },

  setApiKey: async (apiKey) => {
    try {
      const res = await fetch(`${API_BASE}/config/api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey })
      })
      const data = await res.json()
      if (data.success) {
        set({ apiKeyConfigured: true })
      }
      return data
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // ユーティリティ
  setCurrentTool: (tool) => set({ currentTool: tool }),
  clearError: () => set({ error: null })
}))
