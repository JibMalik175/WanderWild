'use client';

import { motion } from 'framer-motion';
import Button from '../components/Button';

const LearningPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">WanderWild Learning Page</h1>
          <div className="p-4 mb-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
            We've just added new tutorial content for both travelers and rural tourism providers. Check out our latest guides on using the AI planner and booking system!
          </div>
        </motion.div>

        <div className="flex gap-4 mb-6">
          <Button>For Travelers</Button>
          <Button variant="outline">For Providers</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started for Travelers</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Traveler Registration Tutorial</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Learn how to create and set up your traveler account on WanderWild</p>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tutorial Script Overview</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              "Welcome to the WanderWild traveler registration tutorial! WanderWild connects you with authentic rural tourism experiences offered by local providers across the country. By creating a traveler account, you'll be able to search for unique stays and experiences, save itineraries, make bookings, and communicate directly with rural tourism providers. Let's get you started on your journey to discover the hidden gems of rural tourism."
            </p>

            <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Visit the WanderWild Website</strong> – Go to wanderwild.com and click 'Sign Up'.</li>
              <li><strong>Choose Traveler Account</strong> – Select 'Register as Traveler'.</li>
              <li><strong>Enter Your Basic Information</strong> – Full name, email, password.</li>
              <li><strong>Verify Your Email</strong> – Confirm your email to secure the account.</li>
              <li><strong>Complete Your Profile</strong> – Add photo, phone, preferences.</li>
              <li><strong>Set Your Travel Interests</strong> – Culture, adventure, food, eco-tourism, homestays.</li>
              <li><strong>Configure Notification Preferences</strong> – Email or mobile updates.</li>
              <li><strong>Connect Payment Methods (Optional)</strong> – Cards, online banking, etc.</li>
              <li><strong>Explore the Dashboard</strong> – View trips, itineraries, bookings, recommendations.</li>
              <li><strong>Start Exploring Experiences</strong> – Browse or use AI Itinerary.</li>
            </ol>

            <h4 className="mt-6 font-semibold text-gray-900 dark:text-white mb-2">Making the Most of Your WanderWild Account</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Personalized Recommendations</li>
              <li>AI Itinerary Planning</li>
              <li>Saved Searches</li>
              <li>Reviews and Ratings</li>
              <li>Loyalty Benefits</li>
              <li>Direct Communication</li>
            </ul>

            <h4 className="mt-6 font-semibold text-gray-900 dark:text-white mb-2">Account Security Best Practices</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Use a strong, unique password</li>
              <li>Keep contact info current</li>
              <li>Ensure secure payment networks</li>
              <li>Review booking details before paying</li>
              <li>Monitor your bookings and transactions</li>
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Traveler's Quick Start Guide</h2>
            <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
              <li>Create an account and complete your profile</li>
              <li>Use the AI planner to create a personalized itinerary</li>
              <li>Browse available tour packages or request custom bids</li>
              <li>Book and pay for your rural experience</li>
              <li>Receive confirmation and trip details</li>
              <li>Enjoy your experience and leave a review</li>
            </ol>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Video Tutorials</h3>
              <p className="text-gray-600 dark:text-gray-300">Coming soon: step-by-step videos for travelers and providers.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
