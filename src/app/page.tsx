"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { CSVRow } from "../types";
import { TaskList } from "../components/TaskList";
import { TaskDetails } from "../components/TaskDetails";
import {
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<CSVRow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [isListCollapsed, setIsListCollapsed] = useState(false);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch("/sample-data.csv");
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const parsedData = results.data
              .map((row: unknown) => {
                const typedRow = row as Record<string, string>;
                return {
                  task_id: typedRow["task_id"] || "",
                  prompt: typedRow["prompt"] || "",
                  last_human_message: typedRow["last_human_message"] || "",
                  response_A: typedRow["response_A"] || "",
                  response_B: typedRow["response_B"] || "",
                  preference:
                    typedRow[
                      "Which do you prefer (Response A or Response B)"
                    ] || "",
                  reasoning:
                    typedRow["Why do you prefer the one that you do?"] || "",
                  strength:
                    typedRow[
                      "On a scale from 0-3 (inclusive) how strongly do you prefer the response that you chose?"
                    ] || "",
                };
              })
              .filter((row) => row.task_id); // Filter out empty rows

            setData(parsedData);

            // Check for task parameter in URL after data is loaded
            const taskParam = searchParams.get("task");
            if (taskParam) {
              const taskIndex = parseInt(taskParam, 10);
              if (
                !isNaN(taskIndex) &&
                taskIndex >= 0 &&
                taskIndex < parsedData.length
              ) {
                setSelectedIndex(taskIndex);
              }
            }

            setLoading(false);
          },
          error: (error: Error) => {
            setError(error.message);
            setLoading(false);
          },
        });
      } catch {
        setError("Failed to load CSV file");
        setLoading(false);
      }
    };

    loadCSV();
  }, [searchParams]);

  const handleTaskSelection = (index: number) => {
    setSelectedIndex(index);

    // Update URL with task parameter
    const url = new URL(window.location.href);
    url.searchParams.set("task", index.toString());
    router.push(url.pathname + url.search, { scroll: false });
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <div className="text-xl font-semibold text-gray-700">
            Loading CSV data...
          </div>
          <div className="text-sm text-gray-500">
            Please wait while we load your analysis data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-xl font-semibold text-gray-900">
            Oops! Something went wrong
          </div>
          <div className="text-sm text-gray-600 text-center">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Micro Analysis Tool
              </h1>
              <p className="text-gray-600 text-sm">
                Beautiful analysis of your evaluation data
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  {data.length} tasks loaded
                </span>
              </div>
              {selectedIndex !== null && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">
                    Task #{selectedIndex + 1} selected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-6">
          {/* Main Content */}
          <div className="flex gap-8 relative">
            {/* Task List - Fixed Position */}
            <div
              className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/90 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 z-40 ${
                isListCollapsed ? "w-12" : "w-96"
              }`}
            >
              {/* Collapse/Expand Button */}
              <button
                onClick={() => setIsListCollapsed(!isListCollapsed)}
                className="absolute -right-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-50"
              >
                {isListCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-3 h-3 text-gray-600" />
                )}
              </button>

              {!isListCollapsed && (
                <div className="h-full overflow-hidden">
                  <TaskList
                    data={data}
                    selectedIndex={selectedIndex}
                    onSelectTask={handleTaskSelection}
                  />
                </div>
              )}
            </div>

            {/* Task Details - Adjusted margin */}
            <div
              className={`flex-1 transition-all duration-300 ${
                isListCollapsed ? "ml-12" : "ml-96"
              }`}
            >
              {selectedIndex !== null ? (
                <TaskDetails
                  data={data[selectedIndex]}
                  index={selectedIndex}
                  collapsedSections={collapsedSections}
                  onToggleSection={toggleSection}
                />
              ) : (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/20">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Select a Task
                  </h3>
                  <p className="text-gray-600">
                    Choose a task from the list to view detailed analysis and
                    evaluation data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
