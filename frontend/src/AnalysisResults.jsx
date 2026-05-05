import ScoreCard from './components/ScoreCard'
import StatsGrid from './components/StatsGrid'
import RadarChartPanel from './components/RadarChartPanel'
import KeywordsSection from './components/KeywordsSection'
import RecommendationsList from './components/RecommendationsList'

export default function AnalysisResults ({ analysis }) {
  return (
    <div className='space-y-6'>
      <ScoreCard analysis={analysis} />

      <StatsGrid scoreBreakdown={analysis.score_breakdown} />

      <div className='grid grid-cols-3 gap-6'>
        <div className='col-span-2 space-y-4'>
          <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
            <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2'>
              <span className='text-emerald-400'>✓</span> Strengths
            </h3>
            <ul className='space-y-3'>
              {analysis.strengths?.map((s, i) => (
                <li key={i} className='flex gap-3 text-gray-300'>
                  <span className='text-emerald-500 mt-0.5'>✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
            <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2'>
              <span className='text-yellow-400'>→</span> Areas to Improve
            </h3>
            <ul className='space-y-3'>
              {analysis.improvements?.map((s, i) => (
                <li key={i} className='flex gap-3 text-gray-300'>
                  <span className='text-yellow-500 mt-0.5'>→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='space-y-4'>
          <RadarChartPanel scoreBreakdown={analysis.score_breakdown} score={analysis.score} />

          <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
            <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4'>ATS Compatibility</h3>
            <p className={`text-sm mb-4 font-medium ${analysis.ats_friendly ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {analysis.ats_message || (analysis.ats_friendly ? '✓ ATS Friendly' : '✗ Not ATS Friendly')}
            </p>
            <div className='space-y-2'>
              {Object.entries(analysis.sections || {}).map(([key, val]) => (
                <div key={key} className={`flex items-center gap-3 text-sm ${val ? 'text-emerald-400' : 'text-gray-500'}`}>
                  <span className='w-5'>{val ? '✓' : '✗'}</span>
                  <span className='capitalize'>{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <KeywordsSection keywordsFound={analysis.keywords_found} keywordsMissing={analysis.keywords_missing} />

      <RecommendationsList recommendations={analysis.recommendations} />

      {(analysis.tech_stack?.length > 0 || analysis.employment_gaps?.length > 0) && (
        <div className='grid grid-cols-2 gap-6'>
          {analysis.tech_stack?.length > 0 && (
            <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
              <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4'>Tech Stack</h3>
              <div className='flex gap-2 flex-wrap'>
                {analysis.tech_stack.map((t, i) => (
                  <span key={i} className='px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs border border-indigo-500/30'>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.employment_gaps?.length > 0 && (
            <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
              <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4'>Employment Gaps</h3>
              <ul className='space-y-2'>
                {analysis.employment_gaps.map((g, i) => (
                  <li key={i} className='text-gray-400 text-sm flex items-center gap-2'>
                    <span className='text-yellow-500'>⚠</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
