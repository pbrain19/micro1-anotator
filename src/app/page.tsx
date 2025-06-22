import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Micro Analysis Tool
        </h1>
        <p className="text-gray-600 mb-8">
          Analyze your evaluation data with beautiful, interactive
          visualizations.
        </p>
        <div className="space-y-4">
          <Link
            href="/tasks"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Tasks
          </Link>
          <Link
            href="/experts"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View Experts
          </Link>
        </div>
      </div>
    </div>
  );
}
