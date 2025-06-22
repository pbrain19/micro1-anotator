"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Utility function for conditional classnames
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Micro Analysis Tool
              </h1>
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                href="/tasks"
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  isActive("/tasks")
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Tasks
              </Link>

              <Link
                href="/experts"
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  isActive("/experts")
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Experts
              </Link>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Beautiful analysis of your evaluation data
          </div>
        </div>
      </div>
    </nav>
  );
}
