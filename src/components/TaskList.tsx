import React, { useState, useMemo } from "react";
import { CSVRow } from "../types";

interface TaskListProps {
  data: CSVRow[];
  selectedIndex: number | null;
  onSelectTask: (index: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  data,
  selectedIndex,
  onSelectTask,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="rounded-lg shadow-md p-4 max-h-screen overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        Tasks ({filteredData.length}
        {data.length !== filteredData.length && ` of ${data.length}`})
      </h2>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search by Task ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No tasks found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          filteredData.map(({ item, originalIndex }) => (
            <div
              key={originalIndex}
              onClick={() => onSelectTask(originalIndex)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedIndex === originalIndex
                  ? "border-2 bg-blue-800/50"
                  : "border-2 border-transparent hover:bg-blue-800/50"
              }`}
            >
              <div className="font-medium text-sm">#{originalIndex + 1}</div>
              <div className="text-xs truncate">
                {item.task_id.substring(0, 8)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
