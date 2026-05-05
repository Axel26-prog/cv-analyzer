export default function HistoryItem ({ item, onClick }) {
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <button
      onClick={onClick}
      className='w-full bg-gray-900 hover:bg-gray-800 rounded-2xl p-5 border border-gray-800 text-left transition-colors'
    >
      <div className='flex justify-between items-center'>
        <div>
          <p className='text-white text-sm font-medium'>{item.filename}</p>
          <p className='text-gray-500 text-xs mt-1'>{new Date(item.created_at).toLocaleString()}</p>
        </div>
        <span className={`text-2xl font-bold ${getScoreColor(item.result.score)}`}>
          {item.result.score}
        </span>
      </div>
    </button>
  )
}
