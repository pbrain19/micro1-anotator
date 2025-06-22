"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTaskContext } from "./TaskContext";
import { TaskList } from "./TaskList";
import { TaskDetails } from "./TaskDetails";
import { FileUpload } from "./FileUpload";
import {
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
} from "lucide-react";

export default function TasksApp() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");

  const {
    enhancedTasks,
    tasksMap,
    loading,
    error,
    filesUploaded,
    tasksReady,
    handleFilesSelected,
    clearAllData,
  } = useTaskContext();

  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const handleToggleSection = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Get the selected task if taskId is provided
  const selectedTask = taskId ? tasksMap.get(taskId)?.task || null : null;

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
            onClick={clearAllData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show file upload interface if files haven't been uploaded yet
  if (!filesUploaded) {
    return <FileUpload onFilesSelected={handleFilesSelected} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 text-sm">
                {enhancedTasks.length} tasks loaded
              </p>
              {selectedTask && (
                <span className="text-blue-600 text-sm font-medium">
                  → {taskId}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              {filesUploaded && (
                <button
                  onClick={clearAllData}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors"
                  title="Clear all data and start over"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <div className="container mx-auto px-6">
          {/* Main Content */}
          <div className="relative">
            {/* Task List - Fixed Position */}
            <div
              className={`fixed left-0 top-32 h-[calc(100vh-8rem)] bg-white/90 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 z-40 ${
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
                  {tasksReady ? (
                    <TaskList selectedTaskId={taskId} />
                  ) : (
                    <div className="p-6 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">
                        Loading tasks...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div
              className={`transition-all duration-300 ${
                isListCollapsed ? "ml-12" : "ml-80"
              }`}
            >
              <div className="max-w-full px-6 py-8">
                {selectedTask ? (
                  // Show TaskDetails when a task is selected
                  <TaskDetails
                    key={taskId}
                    task={selectedTask}
                    index={0}
                    collapsedSections={collapsedSections}
                    onToggleSection={handleToggleSection}
                  />
                ) : (
                  // Show default view when no task is selected
                  <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/20">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Select a Task
                    </h3>
                    <p className="text-gray-600">
                      Choose a task from the list to view detailed analysis and
                      evaluation data. Click on any task to navigate to its
                      detail page.
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
