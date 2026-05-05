export default function RecommendationsList ({ recommendations }) {
  if (!recommendations?.length) return null

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-500/10', border: 'border-red-500/20', badge: 'bg-red-500/30 text-red-300' }
      case 'medium': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', badge: 'bg-yellow-500/30 text-yellow-300' }
      default: return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', badge: 'bg-blue-500/30 text-blue-300' }
    }
  }

  return (
    <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
      <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4'>Recommendations</h3>
      <div className='space-y-3'>
        {recommendations.map((rec, i) => {
          const styles = getPriorityStyles(rec.priority)
          return (
            <div key={i} className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
              <div className='flex items-center gap-2 mb-1'>
                <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${styles.badge}`}>
                  {rec.priority}
                </span>
              </div>
              <p className='text-gray-300 text-sm'>{rec.action}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
