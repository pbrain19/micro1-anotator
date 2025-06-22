"use client";

import Link from "next/link";
import { Users, Star, ChevronRight } from "lucide-react";

// Mock expert data for demonstration
const mockExperts = [
  {
    id: "expert-1",
    name: "Dr. Sarah Chen",
    expertise: "Machine Learning",
    rating: 4.9,
    reviews: 245,
    avatar: "SC",
  },
  {
    id: "expert-2",
    name: "Prof. Michael Rodriguez",
    expertise: "Software Engineering",
    rating: 4.8,
    reviews: 187,
    avatar: "MR",
  },
  {
    id: "expert-3",
    name: "Dr. Emily Johnson",
    expertise: "Data Science",
    rating: 4.9,
    reviews: 312,
    avatar: "EJ",
  },
  {
    id: "expert-4",
    name: "Dr. David Kim",
    expertise: "AI Ethics",
    rating: 4.7,
    reviews: 156,
    avatar: "DK",
  },
];

export default function ExpertsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Experts</h1>
              <p className="text-gray-600 text-sm">
                {mockExperts.length} experts available
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Expert evaluation and insights
            </div>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <div className="container mx-auto px-6 py-8">
          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Expert Dashboard Coming Soon
                </h2>
                <p className="text-blue-100">
                  We&apos;re building a comprehensive expert management system.
                  This will include expert profiles, performance analytics, and
                  collaboration tools.
                </p>
              </div>
            </div>
          </div>

          {/* Mock Expert List */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Expert Preview
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Sample expert profiles for demonstration
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {mockExperts.map((expert) => (
                <Link
                  key={expert.id}
                  href={`/experts/${expert.id}`}
                  className="block p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {expert.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {expert.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {expert.expertise}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-700">
                              {expert.rating}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {expert.reviews} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Expert Profiles
              </h4>
              <p className="text-sm text-gray-600">
                Detailed profiles with expertise areas, ratings, and performance
                metrics.
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Performance Analytics
              </h4>
              <p className="text-sm text-gray-600">
                Track expert evaluation quality, consistency, and feedback
                scores.
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ChevronRight className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Task Assignment
              </h4>
              <p className="text-sm text-gray-600">
                Intelligent task routing based on expert specializations and
                availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
