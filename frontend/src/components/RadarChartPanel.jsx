import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function RadarChartPanel ({ scoreBreakdown, score }) {
  const radarData = [
    { subject: 'Format', value: scoreBreakdown?.format_score ?? 70 },
    { subject: 'Content', value: scoreBreakdown?.content_score ?? 70 },
    { subject: 'Relevance', value: scoreBreakdown?.relevance_score ?? 70 },
    { subject: 'ATS', value: scoreBreakdown?.ats_score ?? 70 },
    { subject: 'Overall', value: score }
  ]

  return (
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
  )
}
