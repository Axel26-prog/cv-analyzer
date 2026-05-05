export default function ScoreCard ({ analysis }) {
  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Needs Improvement'
    return 'Poor'
  }

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/30 text-emerald-200'
    if (score >= 60) return 'bg-yellow-500/30 text-yellow-200'
    return 'bg-red-500/30 text-red-200'
  }

  const getScoreTextColor = (score) => {
    if (score >= 80) return 'text-emerald-100'
    if (score >= 60) return 'text-yellow-100'
    return 'text-red-100'
  }

  return (
    <div className={`bg-gradient-to-br ${getScoreGradient(analysis.score)} rounded-2xl p-8 border border-white/10 relative overflow-hidden`}>
      <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
      <div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />
      <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />

      <div className='relative flex items-center gap-8'>
        <div className='relative'>
          <div className='w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center backdrop-blur-sm border-2 border-white/20'>
            <span className={`text-5xl font-bold ${getScoreTextColor(analysis.score)}`}>
              {analysis.score}
            </span>
          </div>
          <div className='absolute inset-0 rounded-full border-2 border-white/10 animate-pulse' />
        </div>

        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(analysis.score)}`}>
              {getScoreLabel(analysis.score)}
            </span>
            <span className='text-white/40 text-xs'>{analysis.seniority_level}</span>
          </div>
          <p className='text-white/80 text-lg leading-relaxed max-w-lg'>{analysis.summary}</p>
          <div className='flex gap-4 mt-4 text-sm text-white/60'>
            <span>{analysis.years_experience}+ years experience</span>
            <span>•</span>
            <span>{analysis.tech_stack?.length || 0} technologies</span>
          </div>
        </div>
      </div>
    </div>
  )
}
