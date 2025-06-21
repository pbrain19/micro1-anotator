"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { CSVRow, ExpertOpinion } from "../types";
import { TaskList } from "../components/TaskList";
import { TaskDetails } from "../components/TaskDetails";
import {
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Task = CSVRow;

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<Task[]>([]);
  const [expertOpinions, setExpertOpinions] = useState<ExpertOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load original CSV data
        const response = await fetch("/sample_data.csv");
        if (!response.ok) {
          throw new Error("Failed to fetch CSV data");
        }
        const csvText = await response.text();

        // Load expert opinions CSV
        const resultsResponse = await fetch("/results.csv");
        if (!resultsResponse.ok) {
          throw new Error("Failed to fetch results CSV data");
        }
        const resultsText = await resultsResponse.text();

        // Parse original data
        Papa.parse<CSVRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("CSV parsing errors:", results.errors);
            }
            setData(results.data);
          },
          error: (error: Error) => {
            throw new Error(`CSV parsing failed: ${error.message}`);
          },
        });

        // Parse expert opinions
        Papa.parse<Record<string, string>>(resultsText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("Results CSV parsing errors:", results.errors);
            }
            // Transform the data to match our interface
            const transformedData = results.data.map(
              (row: Record<string, string>) => ({
                task_id: row["task ID"] || "",
                programming_language: row["Programming Language"] || "",
                topic: row["topic"] || "",
                category: row["category"] || "",
                task_progress: row["Task Progress"] || "",
                assigned_preference_chooser:
                  row["Assigned Preference Chooser"] || "",
                preference_choice: row["Preference Choice"] || "",
                preference_strength:
                  row[
                    "Preference Strength (0-3 scale, 0 being nearly identical with low strength of preference and 3 being highly different and a very strong preference for your choice)"
                  ] || "",
                preference_justification:
                  row[
                    "3+ Sentence Preference Justification (3+ sentences covering the difference in relevance, accuracy, clarity, etc. )"
                  ] || "",
                response_a_image:
                  row[
                    "INSERT RESPONSE A SUPPORTING IMAGE HERE (if you have more than one image, create a google drive with them all and share the link, make sure to change the sharing permissions so all can view)"
                  ] || "",
                response_b_image:
                  row[
                    "INSERT RESPONSE B SUPPORTING IMAGE HERE  (if you have more than one image, create a google drive with them all and share the link, make sure to change the sharing permissions so all can view)"
                  ] || "",
                assigned_reviewer: row["Assigned Reviewer"] || "",
                review: row["Review"] || "",
                justification_for_review:
                  row[
                    "Justification for Review (Why do you agree or disagree with their preference choice in 1-3 sentences?)"
                  ] || "",
              })
            );
            setExpertOpinions(transformedData);
          },
          error: (error: Error) => {
            throw new Error(`Results CSV parsing failed: ${error.message}`);
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTaskSelection = (index: number) => {
    setSelectedIndex(index);

    // Update URL with task parameter
    const url = new URL(window.location.href);
    url.searchParams.set("task", index.toString());
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handleToggleSection = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
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
          <div className="relative">
            {/* Task List - Fixed Position */}
            <div
              className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/90 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 z-40 ${
                isListCollapsed ? "w-12" : "w-80"
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
                    expertOpinions={expertOpinions}
                    selectedIndex={selectedIndex}
                    onSelectTask={handleTaskSelection}
                  />
                </div>
              )}
            </div>

            {/* Task Details - Adjusted margin and max width */}
            <div
              className={`transition-all duration-300 ${
                isListCollapsed ? "ml-12" : "ml-80"
              }`}
            >
              <div className="max-w-full px-6">
                {selectedIndex !== null ? (
                  <TaskDetails
                    data={data[selectedIndex]}
                    index={selectedIndex}
                    collapsedSections={collapsedSections}
                    onToggleSection={handleToggleSection}
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
    </div>
  );
}
