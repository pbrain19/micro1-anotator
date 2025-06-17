import React from "react";
import { CSVRow } from "../types";
import { ConversationDisplay } from "./ConversationDisplay";
import { CollapsibleSection } from "./CollapsibleSection";
import { ResponseDisplay } from "./ResponseDisplay";

interface TaskDetailsProps {
  data: CSVRow;
  index: number;
  collapsedSections: { [key: string]: boolean };
  onToggleSection: (key: string) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  data,
  index,
  collapsedSections,
  onToggleSection,
}) => {
  return (
    <div className="rounded-lg shadow-md p-6 max-h-screen overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Task #{index + 1}</h2>
        <div className="text-sm mb-4">ID: {data.task_id}</div>

        {/* Evaluation Summary */}
        <div className="p-4 rounded-lg mb-6 border">
          <h3 className="font-semibold mb-3">Evaluation Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Preference:</span>{" "}
              <span>{data.preference || "N/A"}</span>
            </div>
            <div>
              <span className="font-medium">Strength:</span>{" "}
              <span>{data.strength || "N/A"}/3</span>
            </div>
          </div>
          {data.reasoning && (
            <div className="mt-3">
              <span className="font-medium">Reasoning:</span>
              <p className="mt-1 leading-relaxed">{data.reasoning}</p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt */}
      {data.prompt && (
        <CollapsibleSection
          title="Original Prompt"
          sectionKey={`prompt-${index}`}
          isCollapsed={collapsedSections[`prompt-${index}`] ?? false}
          onToggle={onToggleSection}
        >
          <ConversationDisplay content={data.prompt} />
        </CollapsibleSection>
      )}

      {/* Last Human Message */}
      {data.last_human_message && (
        <CollapsibleSection
          title="Last Human Message"
          sectionKey={`last-human-${index}`}
          isCollapsed={collapsedSections[`last-human-${index}`] ?? false}
          onToggle={onToggleSection}
        >
          <ConversationDisplay content={data.last_human_message} />
        </CollapsibleSection>
      )}

      {/* Responses */}
      <CollapsibleSection
        title="Responses"
        sectionKey={`responses-${index}`}
        isCollapsed={collapsedSections[`responses-${index}`] ?? false}
        onToggle={onToggleSection}
      >
        <div className="space-y-6">
          <div className="p-4 rounded-lg border">
            <ResponseDisplay title="Response A" response={data.response_A} />
          </div>
          <div className="p-4 rounded-lg border">
            <ResponseDisplay title="Response B" response={data.response_B} />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
