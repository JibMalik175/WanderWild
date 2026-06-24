'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Clock, CheckCircle, XCircle, Send, Plus } from 'lucide-react';
import { useState } from 'react';

const CustomerInquiries = () => {
  const [activeTab, setActiveTab] = useState('all');

  const inquiries = [
    {
      id: 1,
      title: 'Custom Rural Tour Package',
      provider: 'Mountain Adventures Co.',
      status: 'Pending',
      date: '2026-01-15',
      lastMessage: 'Thank you for your inquiry. We are reviewing your requirements and will get back to you within 24 hours.',
      unread: true
    },
    {
      id: 2,
      title: 'Homestay Availability',
      provider: 'Village Stay Network',
      status: 'Replied',
      date: '2026-01-12',
      lastMessage: 'We have availability for your requested dates. Please let us know if you would like to proceed.',
      unread: false
    },
    {
      id: 3,
      title: 'Cultural Experience Booking',
      provider: 'Heritage Tours',
      status: 'Resolved',
      date: '2026-01-08',
      lastMessage: 'Your booking has been confirmed. We look forward to hosting you!',
      unread: false
    },
    {
      id: 4,
      title: 'Group Discount Inquiry',
      provider: 'Rural Retreats',
      status: 'Pending',
      date: '2026-01-10',
      lastMessage: 'We are checking our group rates and will provide you with a detailed quote soon.',
      unread: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Replied': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return Clock;
      case 'Replied': return MessageCircle;
      case 'Resolved': return CheckCircle;
      default: return MessageCircle;
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (activeTab === 'all') return true;
    return inquiry.status.toLowerCase() === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Inquiries</h1>
              <p className="text-gray-600">Manage your communications with tourism providers</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Inquiry
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Inquiries', value: '12', icon: MessageCircle, color: 'bg-blue-500' },
            { title: 'Pending', value: '3', icon: Clock, color: 'bg-yellow-500' },
            { title: 'Replied', value: '7', icon: CheckCircle, color: 'bg-green-500' },
            { title: 'Resolved', value: '2', icon: XCircle, color: 'bg-gray-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'all', label: 'All Inquiries', count: inquiries.length },
                { id: 'pending', label: 'Pending', count: inquiries.filter(i => i.status === 'Pending').length },
                { id: 'replied', label: 'Replied', count: inquiries.filter(i => i.status === 'Replied').length },
                { id: 'resolved', label: 'Resolved', count: inquiries.filter(i => i.status === 'Resolved').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Inquiries List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4"
        >
          {filteredInquiries.map((inquiry, index) => {
            const StatusIcon = getStatusIcon(inquiry.status);
            return (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {inquiry.title}
                        </h3>
                        <p className="text-sm text-gray-600">Provider: {inquiry.provider}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                        {inquiry.unread && (
                          <div className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{inquiry.lastMessage}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{inquiry.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          View Conversation
                        </button>
                        <button className="flex items-center px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg hover:bg-[var(--color-primary-500)]/90 transition-colors">
                          <Send className="w-4 h-4 mr-2" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results */}
        {filteredInquiries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No inquiries found</h3>
            <p className="text-gray-600">You don't have any inquiries in this category yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CustomerInquiries;
