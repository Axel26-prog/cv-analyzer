import { logout } from '../api'

export default function Header ({ tab, setTab, onLogout }) {
  const handleLogout = () => {
    logout()
    onLogout()
  }

  return (
    <header className='border-b border-gray-800/50 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-10'>
      <div className='max-w-5xl mx-auto px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center'>
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <div>
            <h1 className='text-xl font-bold text-white'>CV Analyzer</h1>
            <p className='text-xs text-gray-500'>AI-powered analysis</p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <nav className='flex gap-1'>
            <button
              onClick={() => setTab('analyzer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'analyzer' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              Analyze
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              History
            </button>
          </nav>
          <button onClick={handleLogout} className='text-gray-500 hover:text-gray-300 transition-colors text-sm'>
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
