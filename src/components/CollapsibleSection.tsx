import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  sectionKey: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: (key: string) => void;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  sectionKey,
  children,
  isCollapsed,
  onToggle,
  icon,
  badge,
  badgeColor = "bg-gray-100 text-gray-800",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => onToggle(sectionKey)}
        className="flex items-center justify-between w-full text-left p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold ">{title}</h3>
            {badge && (
              <span
                className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="text-sm font-medium">
            {isCollapsed ? "Show" : "Hide"}
          </span>
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-6">{children}</div>
        </div>
      )}
    </div>
  );
};
