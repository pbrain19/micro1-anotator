"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { CSVRow } from "../types";
import { TaskList } from "../components/TaskList";
import { TaskDetails } from "../components/TaskDetails";
import { Loader2, AlertCircle } from "lucide-react";
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
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Micro Analysis Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Beautiful analysis of your evaluation data
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-gray-600 border border-white/20">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {data.length} tasks loaded
            {selectedIndex !== null && (
              <>
                <span className="mx-2">•</span>
                <span>Task #{selectedIndex + 1} selected</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* List View */}
          <div className="lg:col-span-1">
            <TaskList
              data={data}
              selectedIndex={selectedIndex}
              onSelectTask={handleTaskSelection}
            />
          </div>

          {/* Detail View */}
          <div className="lg:col-span-3">
            {selectedIndex !== null ? (
              <TaskDetails
                data={data[selectedIndex]}
                index={selectedIndex}
                collapsedSections={collapsedSections}
                onToggleSection={toggleSection}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Select a task to get started
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Choose any task from the list on the left to explore the
                    full conversation, responses, and evaluation details in a
                    beautiful, easy-to-read format.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
