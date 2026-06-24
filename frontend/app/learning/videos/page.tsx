'use client';

import { motion } from 'framer-motion';

const LearningVideosPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Video Tutorials</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Short video walk-throughs for travelers and providers. Replace placeholders with real embeds when ready.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">For Travelers</h2>
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">Video Placeholder</div>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>How to register and verify your account</li>
              <li>Using the AI itinerary planner</li>
              <li>Booking and payment walkthrough</li>
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">For Providers</h2>
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">Video Placeholder</div>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Registering your agency</li>
              <li>Creating and managing packages</li>
              <li>Tracking bookings and payments</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LearningVideosPage;
