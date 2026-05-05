import { useState, useEffect } from 'react'
import { getHistory } from './api'
import AnalysisResults from './AnalysisResults'

export default function History () {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getHistory()
      .then(res => setHistory(res.data))
      .catch(() => setError('Failed to load history. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className='text-center text-gray-500 py-20 text-sm'>Loading history...</div>
    )
  }

  if (error) {
    return (
      <div className='bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-4 text-sm'>{error}</div>
    )
  }

  if (history.length === 0) {
    return (
      <div className='text-center text-gray-500 py-20 text-sm'>No analyses yet. Upload a CV to get started.</div>
    )
  }

  if (selected) {
    return (
      <div className='space-y-4'>
        <button
          onClick={() => setSelected(null)}
          className='text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1'
        >
          ← Back to history
        </button>
        <div className='bg-gray-900 rounded-2xl p-4 border border-gray-800'>
          <p className='text-white font-medium'>{selected.filename}</p>
          <p className='text-gray-500 text-xs mt-1'>{new Date(selected.created_at).toLocaleString()}</p>
        </div>
        <AnalysisResults analysis={selected.result} />
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {history.map(item => (
        <button
          key={item.id}
          onClick={() => setSelected(item)}
          className='w-full bg-gray-900 hover:bg-gray-800 rounded-2xl p-5 border border-gray-800 text-left transition-colors'
        >
          <div className='flex justify-between items-center'>
            <div>
              <p className='text-white text-sm font-medium'>{item.filename}</p>
              <p className='text-gray-500 text-xs mt-1'>{new Date(item.created_at).toLocaleString()}</p>
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
