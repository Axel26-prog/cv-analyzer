export default function StatsGrid ({ scoreBreakdown }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const stats = [
    { label: 'Format', value: scoreBreakdown?.format_score, icon: '📄' },
    { label: 'Content', value: scoreBreakdown?.content_score, icon: '📝' },
    { label: 'Relevance', value: scoreBreakdown?.relevance_score, icon: '🎯' },
    { label: 'ATS', value: scoreBreakdown?.ats_score, icon: '🔍' }
  ]

  return (
    <div className='grid grid-cols-4 gap-4'>
      {stats.map((stat, i) => (
        <div key={i} className='bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-lg'>{stat.icon}</span>
            <span className='text-xs text-gray-500 uppercase tracking-wider'>{stat.label}</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(stat.value)}`}>{stat.value ?? '--'}</div>
          <div className='mt-2 bg-gray-800 rounded-full h-1'>
            <div
              className={`h-1 rounded-full ${getBarColor(stat.value)}`}
              style={{ width: `${stat.value || 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
