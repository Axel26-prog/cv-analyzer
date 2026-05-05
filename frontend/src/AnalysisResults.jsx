import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function AnalysisResults ({ analysis }) {
  const radarData = [
    { subject: 'Format', value: analysis.score_breakdown?.format_score ?? 70 },
    { subject: 'Content', value: analysis.score_breakdown?.content_score ?? 70 },
    { subject: 'Relevance', value: analysis.score_breakdown?.relevance_score ?? 70 },
    { subject: 'ATS', value: analysis.score_breakdown?.ats_score ?? 70 },
    { subject: 'Overall', value: analysis.score }
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  return (
    <div className='space-y-6'>
      {/* Hero Score Card */}
      <div className={`bg-gradient-to-br ${getScoreGradient(analysis.score)} rounded-2xl p-8 border border-white/10 relative overflow-hidden`}>
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
        <div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />

        <div className='relative flex items-center gap-8'>
          {/* Score Circle */}
          <div className='relative'>
            <div className='w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center backdrop-blur-sm border-2 border-white/20'>
              <span className={`text-5xl font-bold ${analysis.score >= 80 ? 'text-emerald-100' : analysis.score >= 60 ? 'text-yellow-100' : 'text-red-100'}`}>
                {analysis.score}
              </span>
            </div>
            <div className='absolute inset-0 rounded-full border-2 border-white/10 animate-pulse' />
          </div>

          {/* Score Info */}
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${analysis.score >= 80 ? 'bg-emerald-500/30 text-emerald-200' : analysis.score >= 60 ? 'bg-yellow-500/30 text-yellow-200' : 'bg-red-500/30 text-red-200'}`}>
                {analysis.score >= 80 ? 'Excellent' : analysis.score >= 60 ? 'Needs Improvement' : 'Poor'}
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

      {/* Stats Cards */}
      <div className='grid grid-cols-4 gap-4'>
        {[
          { label: 'Format', value: analysis.score_breakdown?.format_score, icon: '📄' },
          { label: 'Content', value: analysis.score_breakdown?.content_score, icon: '📝' },
          { label: 'Relevance', value: analysis.score_breakdown?.relevance_score, icon: '🎯' },
          { label: 'ATS', value: analysis.score_breakdown?.ats_score, icon: '🔍' }
        ].map((stat, i) => (
          <div key={i} className='bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-lg'>{stat.icon}</span>
              <span className='text-xs text-gray-500 uppercase tracking-wider'>{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(stat.value)}`}>{stat.value ?? '--'}</div>
            <div className='mt-2 bg-gray-800 rounded-full h-1'>
              <div
                className={`h-1 rounded-full ${stat.value >= 80 ? 'bg-emerald-500' : stat.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${stat.value || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-3 gap-6'>
        {/* Strengths & Improvements */}
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

        {/* Right Column - Radar + ATS */}
        <div className='space-y-4'>
          {/* Radar Chart */}
          <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
            <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4'>Profile Breakdown</h3>
            <ResponsiveContainer width='100%' height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke='#374151' />
                <PolarAngleAxis dataKey='subject' tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Radar dataKey='value' stroke='#6366f1' fill='#6366f1' fillOpacity={0.3} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F9FAFB' }}
                  itemStyle={{ color: '#6366f1' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* ATS Status */}
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

      {/* Keywords Section */}
      <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider'>Keywords Analysis</h3>
        </div>
        <div className='space-y-4'>
          {analysis.keywords_found?.length > 0 && (
            <div>
              <p className='text-xs text-gray-500 mb-2'>Found ({analysis.keywords_found.length})</p>
              <div className='flex gap-2 flex-wrap'>
                {analysis.keywords_found.map((k, i) => (
                  <span key={i} className='px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30'>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.keywords_missing?.length > 0 && (
            <div>
              <p className='text-xs text-gray-500 mb-2'>Missing ({analysis.keywords_missing.length})</p>
              <div className='flex gap-2 flex-wrap'>
                {analysis.keywords_missing.map((k, i) => (
                  <span key={i} className='px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30'>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
          <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-4'>Recommendations</h3>
          <div className='space-y-3'>
            {analysis.recommendations.map((rec, i) => (
              <div
                key={i} className={`p-4 rounded-lg border ${
                rec.priority === 'high'
? 'bg-red-500/10 border-red-500/20'
                : rec.priority === 'medium'
? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-blue-500/10 border-blue-500/20'
              }`}
              >
                <div className='flex items-center gap-2 mb-1'>
                  <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${
                    rec.priority === 'high'
? 'bg-red-500/30 text-red-300'
                    : rec.priority === 'medium'
? 'bg-yellow-500/30 text-yellow-300'
                    : 'bg-blue-500/30 text-blue-300'
                  }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className='text-gray-300 text-sm'>{rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tech Stack & Employment Gaps */}
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
