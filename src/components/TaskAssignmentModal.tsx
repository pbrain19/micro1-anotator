import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { TaskWithDuplicates } from "../types";
import { isTaskFullyCompleted } from "./util";
import { X, User, CheckCircle, Hash, Users } from "lucide-react";
import { useTaskContext } from "./TaskContext";

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredTasks: TaskWithDuplicates[];
  tasksMap: Map<string, { task: TaskWithDuplicates; index: number }>;
  filterType: string;
}

interface ExpertStats {
  name: string;
  completedTasksByCategory: { [category: string]: TaskWithDuplicates[] };
  availableTasksInCategories: TaskWithDuplicates[];
}

const TaskAssignmentModalContent: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  filteredTasks,
  tasksMap,
  filterType,
}) => {
  const { enhancedTasks } = useTaskContext(); // Get all tasks for completed work analysis
  const [selectedExpert, setSelectedExpert] = useState<string>("");

  // Get unique experts from ALL tasks (not just filtered)
  const experts = useMemo(() => {
    const expertSet = new Set<string>();
    enhancedTasks.forEach((task) => {
      if (task.expert_opinion?.assigned_preference_chooser) {
        expertSet.add(task.expert_opinion.assigned_preference_chooser);
      }
    });
    return Array.from(expertSet).sort();
  }, [enhancedTasks]);

  // Get categories available in filtered data with task counts
  const availableCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredTasks.forEach((task) => {
      if (task.expert_opinion?.category) {
        const category = task.expert_opinion.category;
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [filteredTasks]);

  // Calculate expert stats: completed work from ALL tasks, available from filtered tasks
  const expertStats = useMemo((): ExpertStats | null => {
    if (!selectedExpert) return null;

    const completedTasksByCategory: {
      [category: string]: TaskWithDuplicates[];
    } = {};
    const expertCategories = new Set<string>();

    // Find ALL completed tasks by this expert across ALL tasks (not just filtered)
    enhancedTasks.forEach((task) => {
      const taskData = tasksMap.get(task.task_id);
      if (
        taskData &&
        task.expert_opinion?.assigned_preference_chooser === selectedExpert &&
        isTaskFullyCompleted(taskData.task)
      ) {
        const category = task.expert_opinion.category || "Uncategorized";
        expertCategories.add(category);

        if (!completedTasksByCategory[category]) {
          completedTasksByCategory[category] = [];
        }
        completedTasksByCategory[category].push(task);
      }
    });

    // Find available tasks from FILTERED tasks, but only in categories where expert has completed work
    const availableTasksInCategories: TaskWithDuplicates[] = [];
    filteredTasks.forEach((task) => {
      const taskData = tasksMap.get(task.task_id);
      if (
        taskData &&
        task.expert_opinion?.category &&
        expertCategories.has(task.expert_opinion.category) &&
        !isTaskFullyCompleted(taskData.task) &&
        (!task.expert_opinion.assigned_preference_chooser ||
          task.expert_opinion.assigned_preference_chooser.trim() === "")
      ) {
        availableTasksInCategories.push(task);
      }
    });

    return {
      name: selectedExpert,
      completedTasksByCategory,
      availableTasksInCategories,
    };
  }, [selectedExpert, enhancedTasks, filteredTasks, tasksMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Task Assignment Tool
              </h2>
              <p className="text-sm text-gray-600">
                Assign tasks based on expert expertise and experience
                {filterType && filterType !== "none" && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Filter: {filterType}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Available Categories Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Available Categories in Current Filter ({filteredTasks.length}{" "}
              tasks)
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(({ category, count }) => (
                <div
                  key={category}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-sm font-medium text-purple-900">
                    {category}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    {count}
                  </span>
                </div>
              ))}
              {availableCategories.length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  No categorized tasks in current filter
                </div>
              )}
            </div>
          </div>

          {/* Expert Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Select Expert
            </label>
            <select
              value={selectedExpert}
              onChange={(e) => setSelectedExpert(e.target.value)}
              className="w-full max-w-md px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">Choose an expert...</option>
              {experts.map((expert) => (
                <option key={expert} value={expert}>
                  {expert}
                </option>
              ))}
            </select>
          </div>

          {/* Expert Stats */}
          {expertStats && (
            <div className="flex-1 overflow-hidden flex gap-8">
              {/* Completed Tasks by Category */}
              <div className="w-1/2 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Completed Work by Category
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {Object.entries(expertStats.completedTasksByCategory)
                    .length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-2">
                        No completed tasks
                      </div>
                      <div className="text-sm text-gray-500">
                        This expert hasn&apos;t completed any tasks yet
                      </div>
                    </div>
                  ) : (
                    Object.entries(expertStats.completedTasksByCategory).map(
                      ([category, tasks]) => (
                        <div
                          key={category}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {category}
                            </h4>
                            <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              {tasks.length} completed
                            </span>
                          </div>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {tasks.slice(0, 5).map((task) => (
                              <div
                                key={task.task_id}
                                className="bg-white p-4 rounded-lg border border-green-100 shadow-sm"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Hash className="w-4 h-4 text-gray-400" />
                                  <span className="font-mono text-sm text-gray-600">
                                    {task.task_id}
                                  </span>
                                </div>
                                {task.duplicates &&
                                  task.duplicates.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-orange-600">
                                      <Users className="w-4 h-4" />
                                      <span>
                                        {task.duplicates.length} duplicates
                                      </span>
                                    </div>
                                  )}
                              </div>
                            ))}
                            {tasks.length > 5 && (
                              <div className="text-sm text-gray-500 text-center py-3 bg-white rounded-lg border border-green-100">
                                ... and {tasks.length - 5} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Available Tasks in Expert's Categories */}
              <div className="w-1/2 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Available Tasks (
                    {expertStats.availableTasksInCategories.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  {expertStats.availableTasksInCategories.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-gray-500 font-medium mb-2">
                        No available tasks
                      </div>
                      <div className="text-sm text-gray-400 max-w-sm mx-auto">
                        All tasks in {selectedExpert}&apos;s categories are
                        already assigned or completed
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expertStats.availableTasksInCategories.map(
                        (task, index) => (
                          <div
                            key={task.task_id}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                  <Hash className="w-5 h-5 text-white" />
                                </div>
                                <div className="font-semibold text-gray-900">
                                  Task #{index + 1}
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="text-sm text-gray-500 mb-1">
                                Task ID
                              </div>
                              <div className="font-mono text-sm bg-white px-3 py-2 rounded-lg text-gray-700 border border-blue-100">
                                {task.task_id}
                              </div>
                            </div>

                            {task.expert_opinion?.category && (
                              <div className="mb-4">
                                <div className="text-sm text-gray-500 mb-1">
                                  Category
                                </div>
                                <div className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-medium border border-blue-200">
                                  {task.expert_opinion.category}
                                </div>
                              </div>
                            )}

                            {task.duplicates && task.duplicates.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                                  <Users className="w-4 h-4" />
                                  <span className="font-medium">
                                    {task.duplicates.length} duplicate
                                    {task.duplicates.length > 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!selectedExpert && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <div className="text-xl text-gray-600 font-semibold mb-3">
                  Select an Expert
                </div>
                <div className="text-gray-500 max-w-md mx-auto">
                  Choose an expert from the dropdown above to see their
                  completed work and available assignments in their areas of
                  expertise
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = (
  props
) => {
  if (typeof window === "undefined") return null;

  return createPortal(<TaskAssignmentModalContent {...props} />, document.body);
};
