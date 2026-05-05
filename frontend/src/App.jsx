import { useState } from 'react'
import { logout } from './api'
import AuthForm from './AuthForm'
import History from './History'
import AnalysisResults from './AnalysisResults'
import AnalysisSkeleton from './AnalysisSkeleton'

export default function App () {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))
  const [tab, setTab] = useState('analyzer')
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [timeoutError, setTimeoutError] = useState(false)

  const handleAnalyzeStream = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setTimeoutError(false)
    setAnalysis(null)
    setIsGenerating(false)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      setTimeoutError(true)
      setLoading(false)
    }, 60000)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cv/analyze/stream`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: controller.signal
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Analysis failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setLoading(false)
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.error) {
                throw new Error(parsed.error)
              }
              if (parsed.score !== undefined) {
                setIsGenerating(false)
                setAnalysis(parsed)
              } else {
                setIsGenerating(true)
              }
            } catch {
              setIsGenerating(true)
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setTimeoutError(true)
      } else if (err.response?.status === 401) {
        logout()
        setAuthed(false)
      } else {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setAuthed(false)
    setAnalysis(null)
  }

  if (!authed) return <AuthForm onAuth={() => setAuthed(true)} />

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      {/* Header */}
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

      <main className='max-w-5xl mx-auto px-6 py-8'>
        {tab === 'history' && <History />}

        {tab === 'analyzer' && (
          <div className='space-y-6'>
            {!analysis && !isGenerating && (
              <>
                {/* Hero Upload Section */}
                <div className='text-center py-12 space-y-4'>
                  <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                    </svg>
                    Powered by GPT-4o
                  </div>
                  <h2 className='text-4xl font-bold text-white'>
                    Analyze your <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400'>CV</span>
                  </h2>
                  <p className='text-gray-400 max-w-md mx-auto'>
                    Upload your resume and get instant AI-powered feedback on formatting, content, ATS compatibility, and more.
                  </p>
                </div>

                {/* Upload Card */}
                <div className='bg-gray-900/50 rounded-2xl p-6 border border-gray-800 backdrop-blur-sm'>
                  <div className='flex gap-6'>
                    {/* File Upload */}
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-300 mb-3'>
                        <span className='flex items-center gap-2'>
                          <svg className='w-4 h-4 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                          </svg>
                          Upload CV
                        </span>
                      </label>
                      <div className='border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer group'>
                        <input
                          type='file'
                          accept='.pdf,.docx'
                          onChange={e => setFile(e.target.files[0])}
                          className='hidden'
                          id='file-upload'
                        />
                        <label htmlFor='file-upload' className='cursor-pointer'>
                          <div className='w-12 h-12 rounded-xl bg-gray-800 group-hover:bg-indigo-600/20 flex items-center justify-center mx-auto mb-3 transition-colors'>
                            <svg className='w-6 h-6 text-gray-400 group-hover:text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                          </div>
                          {file
                            ? <p className='text-sm text-indigo-400 font-medium'>{file.name}</p>
                            : <p className='text-sm text-gray-500'>Drop your CV here or <span className='text-indigo-400'>browse</span></p>}
                          <p className='text-xs text-gray-600 mt-1'>PDF or DOCX, max 5MB</p>
                        </label>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-300 mb-3'>
                        <span className='flex items-center gap-2'>
                          <svg className='w-4 h-4 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9.255-1.755M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                          </svg>
                          Job Description (optional)
                        </span>
                      </label>
                      <textarea
                        rows={5}
                        placeholder='Paste the job description to get a match score...'
                        value={jobDescription}
                        onChange={e => setJobDescription(e.target.value)}
                        className='w-full bg-gray-800/50 text-gray-200 rounded-xl p-4 text-sm resize-none outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600'
                      />
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <div className='mt-6 flex justify-center'>
                    <button
                      onClick={handleAnalyzeStream}
                      disabled={!file || loading}
                      className='px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-500/25'
                    >
                      {loading
                        ? <>
                          <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                          </svg>
                          Analyzing...
                        </>
                        : <>
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
                          </svg>
                          Analyze CV
                        </>}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Error States */}
            {error && (
              <div className='bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-3'>
                <svg className='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                {error}
              </div>
            )}

            {timeoutError && (
              <div className='bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm flex items-center gap-3'>
                <svg className='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Request timed out. Please try again.
              </div>
            )}

            {/* Loading Skeleton */}
            {isGenerating && <AnalysisSkeleton />}

            {/* Results */}
            {analysis && !isGenerating && <AnalysisResults analysis={analysis} />}

            {/* New Analysis Button */}
            {analysis && !isGenerating && (
              <div className='flex justify-center pt-4'>
                <button
                  onClick={() => {
                    setAnalysis(null)
                    setFile(null)
                    setJobDescription('')
                  }}
                  className='text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                  </svg>
                  Analyze another CV
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
