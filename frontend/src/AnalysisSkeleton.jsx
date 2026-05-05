import { motion } from 'framer-motion'

export default function AnalysisSkeleton () {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className='space-y-6'
      variants={container}
      initial='hidden'
      animate='show'
    >
      {/* Hero Score Card */}
      <motion.div className='bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 border border-indigo-500/30' variants={item}>
        <div className='flex items-center gap-6'>
          <div className='relative'>
            <div className='w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center'>
              <span className='text-4xl font-bold'>--</span>
            </div>
            <div className='absolute inset-0 rounded-full border-4 border-indigo-400/30 animate-ping' />
          </div>
          <div className='flex-1'>
            <div className='h-8 w-48 bg-indigo-400/20 rounded-lg mb-3' />
            <div className='h-4 w-32 bg-indigo-400/10 rounded' />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className='grid grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} className='bg-gray-900/50 rounded-xl p-4 border border-gray-800' variants={item}>
            <div className='h-3 w-16 bg-gray-700 rounded mb-2' />
            <div className='h-6 w-12 bg-gray-600 rounded' />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-3 gap-6'>
        <motion.div className='col-span-2 space-y-4' variants={item}>
          <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
            <div className='h-4 w-24 bg-gray-700 rounded mb-4' />
            <div className='space-y-2'>
              <div className='h-3 w-full bg-gray-800 rounded' />
              <div className='h-3 w-4/5 bg-gray-800 rounded' />
            </div>
          </div>
          <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
            <div className='h-4 w-20 bg-gray-700 rounded mb-4' />
            <div className='grid grid-cols-2 gap-3'>
              <div className='h-8 bg-gray-800 rounded-lg' />
              <div className='h-8 bg-gray-800 rounded-lg' />
            </div>
          </div>
        </motion.div>

        <motion.div className='space-y-4' variants={item}>
          <div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800'>
            <div className='h-4 w-16 bg-gray-700 rounded mb-4' />
            <div className='space-y-2'>
              <div className='h-6 w-full bg-gray-800 rounded-full' />
              <div className='h-6 w-full bg-gray-800 rounded-full' />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Keywords */}
      <motion.div className='bg-gray-900/50 rounded-xl p-6 border border-gray-800' variants={item}>
        <div className='h-4 w-20 bg-gray-700 rounded mb-4' />
        <div className='flex gap-2 flex-wrap'>
          <div className='h-7 w-20 bg-gray-800 rounded-full' />
          <div className='h-7 w-24 bg-gray-800 rounded-full' />
          <div className='h-7 w-16 bg-gray-800 rounded-full' />
        </div>
      </motion.div>
    </motion.div>
  )
}
