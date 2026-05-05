export default function UploadSection ({ file, setFile, jobDescription, setJobDescription, onAnalyze, loading }) {
  return (
    <div className='space-y-6'>
      <div className='text-center py-12 space-y-4'>
        <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
          </svg>
          Powered by GPT-4o
        </div>
        <h2 className='text-3xl md:text-4xl font-bold text-white'>
          Analyze your <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400'>CV</span>
        </h2>
        <p className='text-gray-400 max-w-md mx-auto'>
          Upload your resume and get instant AI-powered feedback on formatting, content, ATS compatibility, and more.
        </p>
      </div>

      <div className='bg-gray-900/50 rounded-2xl p-6 border border-gray-800 backdrop-blur-sm'>
        <div className='flex flex-col md:flex-row gap-6'>
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-300 mb-3'>
              <span className='flex items-center gap-2'>
                <svg className='w-4 h-4 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                </svg>
                Upload CV
              </span>
            </label>
            <div className='border-2 border-dashed border-gray-700 rounded-xl p-6 md:p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer group'>
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

        <div className='mt-6 flex justify-center'>
          <button
            onClick={onAnalyze}
            disabled={!file || loading}
            className='px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-500/25'
          >
            {loading
              ? (
                <>
                  <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Analyzing...
                </>
                )
              : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
                  </svg>
                  Analyze CV
                </>
                )}
          </button>
        </div>
      </div>
    </div>
  )
}
