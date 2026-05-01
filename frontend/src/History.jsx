import { useState, useEffect } from 'react'
import { getHistory } from './api'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getHistory()
      .then(res => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="text-center text-gray-500 py-20 text-sm">Loading history...</div>
  )

  if (history.length === 0) return (
    <div className="text-center text-gray-500 py-20 text-sm">No analyses yet. Upload a CV to get started.</div>
  )

  if (selected) {
    const analysis = selected.result
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          ← Back to history
        </button>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-white font-medium">{selected.filename}</p>
          <p className="text-gray-500 text-xs mt-1">{new Date(selected.created_at).toLocaleString()}</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
          <p className="text-gray-400 text-sm mb-1">Overall Score</p>
          <p className={`text-6xl font-bold ${analysis.score >= 75 ? 'text-green-400' : analysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {analysis.score}
          </p>
          <p className="text-gray-500 text-sm mt-1">out of 100</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-sm text-gray-400 mb-2">Summary</h2>
          <p className="text-gray-200 text-sm leading-relaxed">{analysis.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-sm text-green-400 mb-3">Strengths</h2>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-green-500">✓</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-sm text-yellow-400 mb-3">Improvements</h2>
            <ul className="space-y-2">
              {analysis.improvements.map((s, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-yellow-500">→</span>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-sm text-gray-400 mb-3">Keywords</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {analysis.keywords_found.map((k, i) => (
              <span key={i} className="bg-green-900/40 text-green-400 text-xs px-3 py-1 rounded-full border border-green-800">{k}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords_missing.map((k, i) => (
              <span key={i} className="bg-red-900/40 text-red-400 text-xs px-3 py-1 rounded-full border border-red-800">{k}</span>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-sm text-gray-400 mb-3">ATS & Sections</h2>
          <p className={`text-sm mb-3 ${analysis.ats_friendly ? 'text-green-400' : 'text-red-400'}`}>
            {analysis.ats_friendly ? '✓ ATS Friendly' : '✗ Not ATS Friendly'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(analysis.sections).map(([key, val]) => (
              <div key={key} className={`text-xs px-3 py-2 rounded-lg ${val ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {val ? '✓' : '✗'} {key}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map(item => (
        <button
          key={item.id}
          onClick={() => setSelected(item)}
          className="w-full bg-gray-900 hover:bg-gray-800 rounded-2xl p-5 border border-gray-800 text-left transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">{item.filename}</p>
              <p className="text-gray-500 text-xs mt-1">{new Date(item.created_at).toLocaleString()}</p>
            </div>
            <span className={`text-2xl font-bold ${item.result.score >= 75 ? 'text-green-400' : item.result.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {item.result.score}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}