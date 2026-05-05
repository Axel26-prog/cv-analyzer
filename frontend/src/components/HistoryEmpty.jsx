export default function HistoryEmpty ({ loading, error }) {
  if (loading) {
    return <div className='text-center text-gray-500 py-20 text-sm'>Loading history...</div>
  }

  if (error) {
    return <div className='bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-4 text-sm'>{error}</div>
  }

  return <div className='text-center text-gray-500 py-20 text-sm'>No analyses yet. Upload a CV to get started.</div>
}
