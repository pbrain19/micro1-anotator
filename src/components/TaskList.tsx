import React, { useState, useMemo } from "react";
import { TaskWithDuplicates, ExpertOpinion } from "../types";
import { promptTemplate } from "./util";
import { Search, X, Hash, Filter, Copy, Check, Users } from "lucide-react";

interface TaskListProps {
  data: TaskWithDuplicates[];
  expertOpinions: ExpertOpinion[];
  selectedIndex: number | null;
  onSelectTask: (index: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  data,
  expertOpinions,
  selectedIndex,
  onSelectTask,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data.map((item, index) => ({ item, originalIndex: index }));
    }

    return data
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) =>
        item.task_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [data, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const copyRawData = async (
    item: TaskWithDuplicates,
    index: number,
    e: React.MouseEvent
  ) => {
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
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
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
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
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
              {data.length !== filteredData.length && ` of ${data.length}`}{" "}
              items
            </p>
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
            {filteredData.map(({ item, originalIndex }) => (
              <div
                key={originalIndex}
                onClick={() => onSelectTask(originalIndex)}
                className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                  selectedIndex === originalIndex
                    ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                    : "border-transparent bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm"
                }`}
              >
                {/* Task Number */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        selectedIndex === originalIndex
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
                    onClick={(e) => copyRawData(item, originalIndex, e)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                      copiedIndex === originalIndex
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-200"
                    }`}
                    title="Copy expert evaluation template"
                  >
                    {copiedIndex === originalIndex ? (
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
                    <div className="text-xs text-gray-500 mb-1">Evaluator</div>
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
                {selectedIndex === originalIndex && (
                  <div className="absolute top-3 right-12 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
