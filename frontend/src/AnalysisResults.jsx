import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function AnalysisResults({ analysis }) {
  const radarData = [
    { subject: 'Format', value: analysis.score_breakdown?.format_score ?? 70 },
    { subject: 'Content', value: analysis.score_breakdown?.content_score ?? 70 },
    { subject: 'Relevance', value: analysis.score_breakdown?.relevance_score ?? 70 },
    { subject: 'ATS', value: analysis.score_breakdown?.ats_score ?? 70 },
    { subject: 'Overall', value: analysis.score },
  ]

  return (
    <div className="mt-8 space-y-4">

      {/* Score + Radar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center flex flex-col justify-center">
          <p className="text-gray-400 text-sm mb-1">Overall Score</p>
          <p className={`text-6xl font-bold ${analysis.score >= 75 ? 'text-green-400' : analysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {analysis.score}
          </p>
          <p className="text-gray-500 text-sm mt-1">out of 100</p>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${analysis.score >= 75 ? 'bg-green-400' : analysis.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2 text-center">Profile Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#6366f1' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-sm text-gray-400 mb-2">Summary</h2>
        <p className="text-gray-200 text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-sm text-green-400 mb-3">Strengths</h2>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
                <span className="text-green-500">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-sm text-yellow-400 mb-3">Improvements</h2>
          <ul className="space-y-2">
            {analysis.improvements.map((s, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
                <span className="text-yellow-500">→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-sm text-gray-400 mb-3">Keywords</h2>
        <p className="text-xs text-gray-500 mb-2">Found</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {analysis.keywords_found.map((k, i) => (
            <span key={i} className="bg-green-900/40 text-green-400 text-xs px-3 py-1 rounded-full border border-green-800">{k}</span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-2">Missing</p>
        <div className="flex flex-wrap gap-2">
          {analysis.keywords_missing.map((k, i) => (
            <span key={i} className="bg-red-900/40 text-red-400 text-xs px-3 py-1 rounded-full border border-red-800">{k}</span>
          ))}
        </div>
      </div>

      {/* ATS + Sections */}
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