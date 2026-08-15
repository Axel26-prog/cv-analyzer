/* global window, localStorage */
import { useState, useEffect } from 'react'
import { logout, analyzeCVStream } from './api'
import AuthForm from './AuthForm'
import History from './History'
import Applications from './Applications'
import AnalysisResults from './AnalysisResults'
import AnalysisSkeleton from './AnalysisSkeleton'
import VerifyEmail from './VerifyEmail'
import ResetPassword from './ResetPassword'
import ForgotPassword from './ForgotPassword'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import ErrorDisplay from './components/ErrorDisplay'

const ROUTE_KEYS = ['verify-email', 'reset-password', 'forgot-password']

const getRouteFromPath = () => {
  const seg = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
  return ROUTE_KEYS.includes(seg) ? seg : null
}

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
  const [route, setRoute] = useState(getRouteFromPath())

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setRoute(getRouteFromPath())
  }

  useEffect(() => {
    const onPop = () => setRoute(getRouteFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setTimeoutError(false)
    setAnalysis(null)
    setIsGenerating(false)

    const token = localStorage.getItem('token')
    await analyzeCVStream(
      file,
      jobDescription,
      token,
      (parsed) => {
        if (parsed.score !== undefined) {
          setIsGenerating(false)
          setAnalysis(parsed)
        } else {
          setIsGenerating(true)
        }
      },
      () => setLoading(false),
      (err) => {
        if (err.timeout) setTimeoutError(true)
        else setError(err.message)
        setLoading(false)
      }
    )
  }

  const handleLogout = () => {
    logout()
    setAuthed(false)
    setAnalysis(null)
  }

  const handleReset = () => {
    setAnalysis(null)
    setFile(null)
    setJobDescription('')
  }

  if (route === 'verify-email') return <VerifyEmail onNavigate={navigate} />
  if (route === 'reset-password') return <ResetPassword onNavigate={navigate} />
  if (route === 'forgot-password') return <ForgotPassword onNavigate={navigate} />

  if (!authed) {
    return (
      <AuthForm
        onAuth={() => setAuthed(true)}
        onForgotPassword={() => navigate('/forgot-password')}
      />
    )
  }

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      <Header tab={tab} setTab={setTab} onLogout={handleLogout} />

      <main className='max-w-5xl mx-auto px-6 py-8'>
        {tab === 'history' && <History />}

        {tab === 'applications' && <Applications />}

        {tab === 'analyzer' && (
          <div className='space-y-6'>
            {!analysis && !isGenerating && (
              <UploadSection
                file={file}
                setFile={setFile}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                onAnalyze={handleAnalyze}
                loading={loading}
              />
            )}

            <ErrorDisplay error={error} timeout={timeoutError} />

            {isGenerating && <AnalysisSkeleton />}

            {analysis && !isGenerating && <AnalysisResults analysis={analysis} />}

            {analysis && !isGenerating && (
              <div className='flex justify-center pt-4'>
                <button
                  onClick={handleReset}
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
