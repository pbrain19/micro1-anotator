import React from "react";

interface CollapsibleSectionProps {
  title: string;
  sectionKey: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: (key: string) => void;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  sectionKey,
  children,
  isCollapsed,
  onToggle,
}) => {
  return (
    <div className="mb-6">
      <button
        onClick={() => onToggle(sectionKey)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <span className="text-lg ml-2">{isCollapsed ? "▼" : "▲"}</span>
      </button>
      {!isCollapsed && <div className="p-4 rounded-lg border">{children}</div>}
    </div>
  );
};
