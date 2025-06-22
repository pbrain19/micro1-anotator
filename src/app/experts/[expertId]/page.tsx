"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Mail,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";

// Mock expert data
const mockExperts = {
  "expert-1": {
    id: "expert-1",
    name: "Dr. Sarah Chen",
    expertise: "Machine Learning",
    rating: 4.9,
    reviews: 245,
    avatar: "SC",
    email: "sarah.chen@example.com",
    joinDate: "March 2023",
    completedTasks: 89,
    specializations: ["Deep Learning", "Computer Vision", "NLP", "PyTorch"],
    bio: "Dr. Sarah Chen is a leading expert in machine learning with over 10 years of experience in developing AI systems. She has published extensively in top-tier conferences and has worked with major tech companies on cutting-edge ML projects.",
  },
  "expert-2": {
    id: "expert-2",
    name: "Prof. Michael Rodriguez",
    expertise: "Software Engineering",
    rating: 4.8,
    reviews: 187,
    avatar: "MR",
    email: "michael.rodriguez@example.com",
    joinDate: "January 2023",
    completedTasks: 156,
    specializations: ["System Design", "Microservices", "DevOps", "React"],
    bio: "Professor Michael Rodriguez brings decades of software engineering expertise, having led engineering teams at Fortune 500 companies and taught computer science at top universities.",
  },
  "expert-3": {
    id: "expert-3",
    name: "Dr. Emily Johnson",
    expertise: "Data Science",
    rating: 4.9,
    reviews: 312,
    avatar: "EJ",
    email: "emily.johnson@example.com",
    joinDate: "November 2022",
    completedTasks: 203,
    specializations: ["Statistical Analysis", "Python", "SQL", "Visualization"],
    bio: "Dr. Emily Johnson is a renowned data scientist with expertise in statistical modeling and machine learning. She has helped numerous organizations extract insights from complex datasets.",
  },
  "expert-4": {
    id: "expert-4",
    name: "Dr. David Kim",
    expertise: "AI Ethics",
    rating: 4.7,
    reviews: 156,
    avatar: "DK",
    email: "david.kim@example.com",
    joinDate: "May 2023",
    completedTasks: 67,
    specializations: [
      "Fairness in AI",
      "Privacy",
      "Algorithmic Bias",
      "Policy",
    ],
    bio: "Dr. David Kim specializes in AI ethics and responsible AI development. He has advised governments and organizations on ethical AI implementation and regulatory frameworks.",
  },
};

export default function ExpertDetailPage() {
  const params = useParams();
  const expertId = params.expertId as string;
  const expert = mockExperts[expertId as keyof typeof mockExperts];

  if (!expert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-md">
          <div className="text-xl font-semibold text-gray-900">
            Expert Not Found
          </div>
          <div className="text-sm text-gray-600 text-center">
            The expert you&apos;re looking for doesn&apos;t exist or may have
            been removed.
          </div>
          <Link
            href="/experts"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Experts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/experts"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Experts</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {expert.name}
              </h1>
            </div>
            <div className="text-sm text-gray-500">Expert Profile</div>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <div className="container mx-auto px-6 py-8">
          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8" />
              <div>
                <h2 className="text-lg font-bold mb-1">
                  Expert Details Coming Soon
                </h2>
                <p className="text-orange-100 text-sm">
                  Full expert profiles with detailed analytics and collaboration
                  history are in development.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Expert Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sticky top-24">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {expert.avatar}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {expert.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{expert.expertise}</p>

                  <div className="flex items-center justify-center space-x-1 mb-6">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900">
                      {expert.rating}
                    </span>
                    <span className="text-gray-500">
                      ({expert.reviews} reviews)
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{expert.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {expert.joinDate}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{expert.completedTasks} tasks completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
              </div>

              {/* Specializations */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expert.specializations.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Stats (Mock) */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {expert.rating}
                    </div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {expert.completedTasks}
                    </div>
                    <div className="text-sm text-gray-600">Tasks Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      98%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      2.1d
                    </div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
