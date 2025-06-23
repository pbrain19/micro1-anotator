import React, { useState, useMemo, useEffect } from "react";
import { TaskWithDuplicates } from "../types";
import {
  promptTemplate,
  getBatchesReadyForReview,
  getIncompleteBatches,
} from "./util";
import { Search, X, Hash, Filter, Copy, Check, Users } from "lucide-react";
import { useTaskContext } from "./TaskContext";
import { useRouter } from "next/navigation";

interface TaskListProps {
  selectedTaskId?: string | null;
}

export const TaskList: React.FC<TaskListProps> = ({ selectedTaskId }) => {
  const router = useRouter();
  const { enhancedTasks, expertOpinions, tasksMap } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedTaskIds, setCopiedTaskIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<"none" | "ready" | "incomplete">(
    "none"
  );

  // Filter data based on search term and batch filter
  const filteredData = useMemo(() => {
    let baseData = enhancedTasks.map((item, index) => ({
      item,
      originalIndex: index,
    }));

    // Apply batch filter if enabled
    if (filterType !== "none") {
      let filteredTaskIds: Set<string>;

      if (filterType === "ready") {
        filteredTaskIds = getBatchesReadyForReview(enhancedTasks, tasksMap);
      } else if (filterType === "incomplete") {
        filteredTaskIds = getIncompleteBatches(enhancedTasks, tasksMap);
      } else {
        filteredTaskIds = new Set();
      }

      // Filter to only include tasks from filtered batches
      baseData = baseData.filter(({ item }) =>
        filteredTaskIds.has(item.task_id)
      );
    }

    // Apply search term filter
    if (!searchTerm.trim()) {
      return baseData;
    }

    return baseData.filter(({ item }) =>
      item.task_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enhancedTasks, searchTerm, filterType, tasksMap]);

  const getFilterDescription = () => {
    switch (filterType) {
      case "ready":
        return " (batches ready for review)";
      case "incomplete":
        return " (incomplete batches)";
      default:
        return "";
    }
  };

  console.log(
    `Filtered data: ${filteredData.length} tasks${getFilterDescription()}`
  );

  useEffect(() => {
    console.log("mounding");
    return () => {
      console.log("unmounting");
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleTaskClick = (taskId: string) => {
    // Use shallow routing with search params instead of dynamic route
    router.push(`/tasks?taskId=${taskId}`, { scroll: false });
  };

  const copyRawData = async (item: TaskWithDuplicates, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task selection when clicking copy button

    // Find the corresponding expert opinion for this task
    const expertOpinion = expertOpinions.find(
      (opinion) => opinion.task_id === item.task_id
    );

    if (!expertOpinion) {
      // Fallback to original format if no expert opinion found
      const rawData = `Task ID: ${item.task_id}
Prompt: ${item.prompt}
Last Human Message: ${item.last_human_message}
Response A: ${item.response_A}
Response B: ${item.response_B}
Preference: ${item.preference}
Reasoning: ${item.reasoning}
Strength: ${item.strength}`;

      try {
        await navigator.clipboard.writeText(rawData);
        setCopiedTaskIds((prev) => new Set(prev).add(item.task_id));
        setTimeout(() => {
          setCopiedTaskIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(item.task_id);
            return newSet;
          });
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      return;
    }

    // Create the expert opinion string
    const taskerOpinion = `Preference Choice: ${expertOpinion.preference_choice}
Preference Strength: ${expertOpinion.preference_strength}
Preference Justification: ${expertOpinion.preference_justification}`;

    // Create the context string with task data
    const context = `Task ID: ${item.task_id}
Prompt: ${item.prompt}
Last Human Message: ${item.last_human_message}
Response A: ${item.response_A}
Response B: ${item.response_B}
Original Preference: ${item.preference}
Original Reasoning: ${item.reasoning}
Original Strength: ${item.strength}`;

    // Use the template to create the final text
    const templateText = promptTemplate(taskerOpinion, context);

    try {
      await navigator.clipboard.writeText(templateText);
      setCopiedTaskIds((prev) => new Set(prev).add(item.task_id));
      setTimeout(() => {
        setCopiedTaskIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(item.task_id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getPreferenceColor = (preference: string) => {
    switch (preference.toLowerCase()) {
      case "response a":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "response b":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStrengthBadge = (strength: string) => {
    const num = parseInt(strength) || 0;
    const colors = [
      "bg-red-100 text-red-800",
      "bg-yellow-100 text-yellow-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
    ];
    return colors[num] || colors[0];
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
            <p className="text-sm text-gray-600">
              {filteredData.length}
              {enhancedTasks.length !== filteredData.length &&
                ` of ${enhancedTasks.length}`}{" "}
              items
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("none")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterType === "none"
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setFilterType("ready")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterType === "ready"
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              Ready for Review
            </button>
            <button
              onClick={() => setFilterType("incomplete")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterType === "incomplete"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              Incomplete Batches
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Task ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-gray-500 font-medium mb-2">No tasks found</div>
            <div className="text-sm text-gray-400">
              Try adjusting your search term: &quot;{searchTerm}&quot;
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredData.map(({ item, originalIndex }) => {
              const isSelected = selectedTaskId === item.task_id;
              return (
                <div
                  key={item.task_id}
                  onClick={() => handleTaskClick(item.task_id)}
                  className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                      : "border-transparent bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm"
                  }`}
                >
                  {/* Task Number */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                        }`}
                      >
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">
                        Task #{originalIndex + 1}
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={(e) => copyRawData(item, e)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                        copiedTaskIds.has(item.task_id)
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-200"
                      }`}
                      title="Copy expert evaluation template"
                    >
                      {copiedTaskIds.has(item.task_id) ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Task ID */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Task ID</div>
                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 truncate">
                      {item.task_id}
                    </div>
                  </div>

                  {/* Expert Evaluator */}
                  {item.expert_opinion && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Evaluator
                      </div>
                      <div className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">
                        {item.expert_opinion.assigned_preference_chooser}
                      </div>
                    </div>
                  )}

                  {/* Duplicates indicator */}
                  {item.duplicates && item.duplicates.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                        <Users className="w-3 h-3" />
                        <span>
                          {item.duplicates.length} duplicate
                          {item.duplicates.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Preference badges */}
                  <div className="flex flex-wrap gap-2">
                    {item.preference && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full border font-medium ${getPreferenceColor(
                          item.preference
                        )}`}
                      >
                        {item.preference}
                      </span>
                    )}
                    {item.strength && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStrengthBadge(
                          item.strength
                        )}`}
                      >
                        Strength: {item.strength}
                      </span>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-12 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
