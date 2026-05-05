export default function ErrorDisplay ({ error, timeout }) {
  if (timeout) {
    return (
      <div className='bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm flex items-center gap-3'>
        <svg className='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        Request timed out. Please try again.
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-3'>
        <svg className='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        {error}
      </div>
    )
  }

  return null
}
