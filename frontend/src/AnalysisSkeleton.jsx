import { motion } from 'framer-motion'

export default function AnalysisSkeleton () {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className='mt-8 space-y-4'
      variants={container}
      initial='hidden'
      animate='show'
    >
      <motion.div className='grid grid-cols-2 gap-4' variants={item}>
        <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
          <div className='h-4 w-24 bg-gray-700 rounded mb-3' />
          <div className='h-14 w-20 bg-gray-700 rounded-lg mb-2' />
          <div className='h-3 w-16 bg-gray-700 rounded' />
        </div>
        <div className='bg-gray-900 rounded-2xl p-4 border border-gray-800'>
          <div className='h-4 w-28 bg-gray-700 rounded mx-auto mb-4' />
          <div className='h-36 bg-gray-800 rounded-lg' />
        </div>
      </motion.div>

      <motion.div className='bg-gray-900 rounded-2xl p-6 border border-gray-800' variants={item}>
        <div className='h-4 w-16 bg-gray-700 rounded mb-3' />
        <div className='space-y-2'>
          <div className='h-4 bg-gray-800 rounded' />
          <div className='h-4 w-3/4 bg-gray-800 rounded' />
        </div>
      </motion.div>

      <motion.div className='grid grid-cols-2 gap-4' variants={item}>
        <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
          <div className='h-4 w-20 bg-gray-700 rounded mb-3' />
          <div className='space-y-2'>
            <div className='h-4 w-full bg-gray-800 rounded' />
            <div className='h-4 w-5/6 bg-gray-800 rounded' />
          </div>
        </div>
        <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
          <div className='h-4 w-24 bg-gray-700 rounded mb-3' />
          <div className='space-y-2'>
            <div className='h-4 w-full bg-gray-800 rounded' />
            <div className='h-4 w-4/5 bg-gray-800 rounded' />
          </div>
        </div>
      </motion.div>

      <motion.div className='bg-gray-900 rounded-2xl p-6 border border-gray-800' variants={item}>
        <div className='h-4 w-20 bg-gray-700 rounded mb-3' />
        <div className='flex gap-2 mb-3'>
          <motion.div
            className='h-6 w-16 bg-gray-800 rounded-full'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className='h-6 w-20 bg-gray-800 rounded-full'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className='h-6 w-14 bg-gray-800 rounded-full'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        <div className='flex gap-2'>
          <motion.div
            className='h-6 w-18 bg-gray-800 rounded-full'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className='h-6 w-22 bg-gray-800 rounded-full'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </motion.div>

      <motion.div className='bg-gray-900 rounded-2xl p-6 border border-gray-800' variants={item}>
        <div className='h-4 w-24 bg-gray-700 rounded mb-3' />
        <div className='grid grid-cols-2 gap-2'>
          <motion.div
            className='h-8 bg-gray-800 rounded-lg'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className='h-8 bg-gray-800 rounded-lg'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className='h-8 bg-gray-800 rounded-lg'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className='h-8 bg-gray-800 rounded-lg'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
