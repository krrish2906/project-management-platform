"use client";

import { Search, ChevronDown, ArrowRight, LifeBuoy, BookOpen, Zap, MessageCircle, FileText, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function HelpPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: 'How do I use the Kanban Board?',
            answer: 'Navigate to any project and click "Manage Board". You can drag and drop tasks between "To Do", "In Progress", and "Done" columns. The changes will sync in real-time with your team.'
        },
        {
            question: 'How do I invite team members?',
            answer: 'Inside a project, click the "Team" tab, then click the "Invite Member" button. Enter their email address and assign them a role.'
        },
        {
            question: 'Does the chatroom support file sharing?',
            answer: 'Yes! Inside the Team Chats, click the paperclip icon next to the chat input to upload and share files with your team instantly.'
        },
        {
            question: 'How do I update my profile details?',
            answer: 'Go to the Settings page via the sidebar. Under the "Account" tab, you can update your name and email address. Click "Save Changes" to apply.'
        },
        {
            question: 'How can I change my password?',
            answer: 'In the Settings page, navigate to the "Security" tab. You will need to enter your current password along with your new password to securely update it.'
        },
        {
            question: 'How do project statuses work?',
            answer: 'Project statuses (Active, Completed, Archived) provide a quick overview of a project\'s lifecycle. You can view these from the Dashboard or Project Overview.'
        }
    ];

    const filteredFaqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            
            <div className="flex-1 flex flex-col overflow-auto">
                {/* Help Center Header */}
                <header className="bg-white shadow-sm text-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-bold tracking-tight mb-1 text-blue-600">How can we help you today ?</h1>
                            <p className="text-gray-900 text-lg mb-6">Find answers, guides, and tutorials for ProjectHub</p>
                            
                            <div className="relative max-w-2xl">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Search help articles..."
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Help Categories */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { 
                                icon: BookOpen, 
                                title: 'Getting Started', 
                                description: 'Learn the basics and set up your account',
                                color: 'text-blue-600 bg-blue-100',
                                count: 12
                            },
                            { 
                                icon: FileText, 
                                title: 'Guides & Tutorials', 
                                description: 'Step-by-step guides for all features',
                                color: 'text-green-600 bg-green-100',
                                count: 8
                            },
                            { 
                                icon: Users, 
                                title: 'Team Collaboration', 
                                description: 'Working with your team effectively',
                                color: 'text-purple-600 bg-purple-100',
                                count: 15
                            },
                            { 
                                icon: Settings, 
                                title: 'Account Settings', 
                                description: 'Manage your profile and preferences',
                                color: 'text-yellow-600 bg-yellow-100',
                                count: 6
                            },
                            { 
                                icon: Zap, 
                                title: 'What\'s New', 
                                description: 'Latest features and updates',
                                color: 'text-pink-600 bg-pink-100',
                                count: 5
                            },
                            { 
                                icon: LifeBuoy, 
                                title: 'Contact Support', 
                                description: 'Can\'t find what you need? We\'re here to help',
                                color: 'text-indigo-600 bg-indigo-100',
                                count: null
                            },
                        ].map((category, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-6">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${category.color} mb-4`}>
                                        <category.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                                    <div className="flex items-center justify-between">
                                        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                                            View all
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </a>
                                        {category.count !== null && (
                                            <span className="text-xs font-medium text-gray-500">{category.count} articles</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Articles */}
                <div className="bg-white border-t border-gray-200 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                Popular Help Articles
                            </h2>
                            <p className="mt-3 max-w-2xl mx-auto text-gray-500">
                                Browse our most frequently viewed help articles
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                'Getting started with ProjectHub',
                                'How to invite team members',
                                'Managing project permissions',
                                'Using the task management system',
                                'Integrating with other tools',
                                'Understanding project analytics'
                            ].map((title, index) => (
                                <div key={index} className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-base font-medium text-gray-900">
                                                <a href="#" className="hover:underline focus:outline-none">
                                                    {title}
                                                </a>
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Learn how to get started with {title.toLowerCase()} and make the most of its features.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm">
                                        <a href="#" className="font-medium text-blue-600 hover:text-blue-700 flex items-center">
                                            Read article
                                            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gray-50 py-16">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                Frequently Asked Questions
                            </h2>
                            <p className="mt-3 text-gray-500">
                                Can't find what you're looking for? <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Contact our support team</a>.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {filteredFaqs.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No FAQs found matching your search.</p>
                            ) : (
                                filteredFaqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow"
                                    >
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                                            aria-expanded={openFaq === index}
                                            aria-controls={`faq-${index}`}
                                        >
                                            <span className="text-left font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                                    openFaq === index ? 'transform rotate-180 text-blue-600' : ''
                                                }`}
                                            />
                                        </button>
                                        <div
                                            id={`faq-${index}`}
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                            aria-hidden={openFaq !== index}
                                        >
                                            <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50">
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                                <a 
                                                    href="#" 
                                                    className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group"
                                                >
                                                    Read more
                                                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                            <span className="block">Still need help?</span>
                            <span className="block text-blue-600">Our support team is here for you.</span>
                        </h2>
                        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0
                        ">
                            <div className="inline-flex rounded-md shadow">
                                <a
                                    href="#"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <MessageCircle className="-ml-1 mr-3 h-5 w-5" />
                                    Contact Support
                                </a>
                            </div>
                            <div className="ml-3 inline-flex rounded-md shadow">
                                <a
                                    href="#"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                                >
                                    <Users className="-ml-1 mr-3 h-5 w-5" />
                                    Community Forum
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}