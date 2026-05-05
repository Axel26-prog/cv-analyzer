import { useState } from 'react'
import { logout } from '../api'

export default function Header ({ tab, setTab, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    onLogout()
  }

  return (
    <header className='border-b border-gray-800/50 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-10'>
      <div className='max-w-5xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center'>
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <div>
            <h1 className='text-xl font-bold text-white'>CV Analyzer</h1>
            <p className='text-xs text-gray-500 hidden sm:block'>AI-powered analysis</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className='md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            {mobileMenuOpen
              ? <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              : <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            }
          </svg>
        </button>

        <div className='hidden md:flex items-center gap-4'>
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

      {mobileMenuOpen && (
        <div className='md:hidden border-t border-gray-800/50 bg-gray-950/95 backdrop-blur-sm px-4 py-4 space-y-2'>
          <button
            onClick={() => { setTab('analyzer'); setMobileMenuOpen(false) }}
            className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${tab === 'analyzer' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            Analyze
          </button>
          <button
            onClick={() => { setTab('history'); setMobileMenuOpen(false) }}
            className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${tab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            History
          </button>
          <button
            onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
            className='w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
