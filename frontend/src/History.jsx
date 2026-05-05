import { useState, useEffect } from 'react'
import { getHistory } from './api'
import AnalysisResults from './AnalysisResults'
import HistoryItem from './components/HistoryItem'
import HistoryEmpty from './components/HistoryEmpty'

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

  if (loading || error || history.length === 0) {
    return <HistoryEmpty loading={loading} error={error} />
  }

  return (
    <div className='space-y-3'>
      {history.map(item => (
        <HistoryItem key={item.id} item={item} onClick={() => setSelected(item)} />
      ))}
    </div>
  )
}
