import React from "react";
import { CSVRow } from "../types";
import { ConversationDisplay } from "./ConversationDisplay";
import { CollapsibleSection } from "./CollapsibleSection";
import { ResponseDisplay } from "./ResponseDisplay";
import {
  Hash,
  Trophy,
  Target,
  MessageSquare,
  User,
  Zap,
  Star,
  CheckCircle,
} from "lucide-react";

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

  const getStrengthStars = (strength: string) => {
    const num = parseInt(strength) || 0;
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < num ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Task #{index + 1}</h2>
              <p className="text-blue-100">Detailed analysis and evaluation</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
              Task ID
            </div>
            <div className="font-mono text-sm break-all">{data.task_id}</div>
          </div>
        </div>

        {/* Evaluation Summary */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">
              Evaluation Summary
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Preference */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Preference</span>
              </div>
              {data.preference ? (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getPreferenceColor(
                    data.preference
                  )}`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {data.preference}
                </span>
              ) : (
                <span className="text-gray-500 italic">Not specified</span>
              )}
            </div>

            {/* Strength */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-gray-900">Strength</span>
              </div>
              {data.strength ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {getStrengthStars(data.strength)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {data.strength}/3
                  </span>
                </div>
              ) : (
                <span className="text-gray-500 italic">Not specified</span>
              )}
            </div>
          </div>

          {/* Reasoning */}
          {data.reasoning && (
            <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Reasoning</span>
              </div>
              <p className="text-amber-800 leading-relaxed">{data.reasoning}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Prompt */}
        {data.prompt && (
          <CollapsibleSection
            title="Original Prompt"
            sectionKey={`prompt-${index}`}
            isCollapsed={collapsedSections[`prompt-${index}`] ?? false}
            onToggle={onToggleSection}
            icon={<MessageSquare className="w-5 h-5" />}
            badge="Initial Request"
            badgeColor="bg-blue-100 text-blue-800"
          >
            <ConversationDisplay content={data.prompt} />
          </CollapsibleSection>
        )}

        {/* Last Human Message */}
        {data.last_human_message &&
          data.last_human_message !== data.prompt.replace("Human: ", "") && (
            <CollapsibleSection
              title="Latest Follow-up"
              sectionKey={`last-human-${index}`}
              isCollapsed={collapsedSections[`last-human-${index}`] ?? false}
              onToggle={onToggleSection}
              icon={<User className="w-5 h-5" />}
              badge="Human Message"
              badgeColor="bg-green-100 text-green-800"
            >
              <ConversationDisplay content={data.last_human_message} />
            </CollapsibleSection>
          )}

        {/* Responses */}
        <CollapsibleSection
          title="AI Responses"
          sectionKey={`responses-${index}`}
          isCollapsed={collapsedSections[`responses-${index}`] ?? false}
          onToggle={onToggleSection}
          icon={<Zap className="w-5 h-5" />}
          badge="Compare & Evaluate"
          badgeColor="bg-purple-100 text-purple-800"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 border-b border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded text-xs font-bold flex items-center justify-center">
                      A
                    </div>
                    Response A
                  </h4>
                  {data.preference?.toLowerCase() === "response a" && (
                    <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                      <Trophy className="w-3 h-3" />
                      Preferred
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <ResponseDisplay title="" response={data.response_A} />
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-50 border-b border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-green-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 text-white rounded text-xs font-bold flex items-center justify-center">
                      B
                    </div>
                    Response B
                  </h4>
                  {data.preference?.toLowerCase() === "response b" && (
                    <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      <Trophy className="w-3 h-3" />
                      Preferred
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <ResponseDisplay title="" response={data.response_B} />
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};
