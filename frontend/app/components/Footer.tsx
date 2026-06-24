'use client';

import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-white" style={{ backgroundColor: 'var(--color-footer-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* WanderWild Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">WanderWild</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting travelers with authentic tourism experiences worldwide. Our platform brings together airlines, tour operators, hotels, and homestays.
            </p>
          </div>

          {/* For Travelers Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Travelers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Search Tours
                </Link>
              </li>
              <li>
                <Link href="/travel-insurance" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Travel Insurance
                </Link>
              </li>
              <li>
                <Link href="/travel-guides" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Travel Guides
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Providers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Join as Provider
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Pricing & Commissions
                </Link>
              </li>
              <li>
                <Link href="/provider-resources" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Provider Resources
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/provider-faq" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Provider FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start space-x-2 text-gray-300">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">123 Tourism Road, Kuala Lumpur, Malaysia</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Mail size={16} className="flex-shrink-0" />
                <span className="text-sm">info@wanderwild.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Phone size={16} className="flex-shrink-0" />
                <span className="text-sm">+60 3 1234 5678</span>
              </li>
            </ul>
            
            {/* Newsletter Subscription */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Subscribe to Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-3 py-2 bg-gray-800 text-white text-sm rounded-l-lg border border-gray-700 focus:outline-none focus:border-gray-600"
                />
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-r-lg hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>WanderWild @ Meeca Legacy 2026. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
