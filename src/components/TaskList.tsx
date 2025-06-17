import React from "react";
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
  return (
    <div className="rounded-lg shadow-md p-4 max-h-screen overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Tasks ({data.length})</h2>
      <div className="space-y-2">
        {data.map((row, index) => (
          <div
            key={index}
            onClick={() => onSelectTask(index)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedIndex === index
                ? "border-2 bg-blue-800/50"
                : "border-2 border-transparent hover:bg-blue-800/50"
            }`}
          >
            <div className="font-medium text-sm">#{index + 1}</div>
            <div className="text-xs truncate">
              {row.task_id.substring(0, 8)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
