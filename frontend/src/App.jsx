import { useState } from 'react'
import { analyzeCV, logout } from './api'
import AuthForm from './AuthForm'
import History from './History'
import AnalysisResults from './AnalysisResults'

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))
  const [tab, setTab] = useState('analyzer')
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [streamingText, setStreamingText] = useState('')

  const handleAnalyzeStream = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setStreamingText('')
    setAnalysis(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cv/analyze/stream`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
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
                setAnalysis(parsed)
              } else {
                setStreamingText(prev => prev + data)
              }
            } catch {
              setStreamingText(prev => prev + data)
            }
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
        setAuthed(false)
      }
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setAuthed(false)
    setAnalysis(null)
    setStreamingText('')
  }

  if (!authed) return <AuthForm onAuth={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white">CV Analyzer</h1>
            <p className="text-gray-400 mt-2">Upload your CV and get instant AI-powered feedback</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          <button
            onClick={() => setTab('analyzer')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${tab === 'analyzer' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Analyzer
          </button>
          <button
            onClick={() => setTab('history')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${tab === 'history' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            History
          </button>
        </div>

        {/* History Tab */}
        {tab === 'history' && <History />}

        {/* Analyzer Tab */}
        {tab === 'analyzer' && (
          <>
            <div className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
              <label className="block text-sm text-gray-400 mb-2">CV File (PDF or DOCX)</label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              {file && <p className="text-xs text-gray-500 mt-2">{file.name}</p>}
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
              <label className="block text-sm text-gray-400 mb-2">Job Description (optional)</label>
              <textarea
                rows={4}
                placeholder="Paste the job description here to get a match score..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 text-sm resize-none outline-none border border-gray-700 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleAnalyzeStream}
              disabled={!file || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze CV'}
            </button>

            {error && (
              <div className="mt-4 bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            {streamingText && !analysis && (
              <div className="mt-4 bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Generating analysis...</p>
                <div className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                  {streamingText}
                  <span className="animate-pulse">▋</span>
                </div>
              </div>
            )}

            {analysis && <AnalysisResults analysis={analysis} />}
          </>
        )}
      </div>
    </div>
  )
}