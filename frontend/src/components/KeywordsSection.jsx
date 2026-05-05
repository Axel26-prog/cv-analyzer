export default function KeywordsSection ({ keywordsFound, keywordsMissing }) {
  if (!keywordsFound?.length && !keywordsMissing?.length) return null

  return (
    <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
      <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4'>Keywords Analysis</h3>
      <div className='space-y-4'>
        {keywordsFound?.length > 0 && (
          <div>
            <p className='text-xs text-gray-500 mb-2'>Found ({keywordsFound.length})</p>
            <div className='flex gap-2 flex-wrap'>
              {keywordsFound.map((k, i) => (
                <span key={i} className='px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30'>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {keywordsMissing?.length > 0 && (
          <div>
            <p className='text-xs text-gray-500 mb-2'>Missing ({keywordsMissing.length})</p>
            <div className='flex gap-2 flex-wrap'>
              {keywordsMissing.map((k, i) => (
                <span key={i} className='px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30'>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
