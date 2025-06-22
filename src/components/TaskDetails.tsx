import React, { useState } from "react";
import { TaskWithDuplicates } from "../types";
import { useTaskContext } from "./TaskContext";
import { promptTemplate } from "./util";
import { ConversationDisplay } from "./ConversationDisplay";
import { CollapsibleSection } from "./CollapsibleSection";
import { ResponseDisplay } from "./ResponseDisplay";
import {
  Trophy,
  MessageSquare,
  User,
  Zap,
  Users,
  Eye,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

interface TaskDetailsProps {
  task: TaskWithDuplicates;
  index: number;
  collapsedSections: { [key: string]: boolean };
  onToggleSection: (key: string) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  index,
  collapsedSections,
  onToggleSection,
}) => {
  const { expertOpinions } = useTaskContext();
  const [copiedTaskIds, setCopiedTaskIds] = useState<Set<string>>(new Set());
  const [copiedExpertEval, setCopiedExpertEval] = useState(false);

  const handleCopyTaskId = async (taskId: string) => {
    try {
      await navigator.clipboard.writeText(taskId);
      setCopiedTaskIds((prev) => new Set(prev).add(taskId));
      setTimeout(() => {
        setCopiedTaskIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy task ID:", err);
    }
  };

  const handleCopyExpertEval = async () => {
    // Find the corresponding expert opinion for this task
    const expertOpinion = expertOpinions.find(
      (opinion) => opinion.task_id === task.task_id
    );

    if (!expertOpinion) {
      // Fallback to original format if no expert opinion found
      const rawData = `Task ID: ${task.task_id}
  Prompt: ${task.prompt}
      ${
        task.prompt && task.prompt.includes(task.last_human_message)
          ? ""
          : `Last Human Message: ${task.last_human_message}`
      }
Response A: ${task.response_A}
Response B: ${task.response_B}
Preference: ${task.preference}
Reasoning: ${task.reasoning}
Strength: ${task.strength}`;

      try {
        await navigator.clipboard.writeText(rawData);
        setCopiedExpertEval(true);
        setTimeout(() => setCopiedExpertEval(false), 2000);
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
    const context = `Task ID: ${task.task_id}
Prompt: ${task.prompt}
${
  task.prompt && task.prompt.includes(task.last_human_message)
    ? ""
    : `Last Human Message: ${task.last_human_message}`
}
Response A: ${task.response_A}
Response B: ${task.response_B}
Original Preference: ${task.preference}
Original Reasoning: ${task.reasoning}
Original Strength: ${task.strength}`;

    // Use the template to create the final text
    const templateText = promptTemplate(taskerOpinion, context);

    try {
      await navigator.clipboard.writeText(templateText);
      setCopiedExpertEval(true);
      setTimeout(() => setCopiedExpertEval(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          {/* Task ID */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
              Task ID
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm break-all flex-1">
                {task.task_id}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleCopyExpertEval}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Copy expert evaluation template"
                >
                  {copiedExpertEval ? (
                    <span>Copied</span>
                  ) : (
                    <span>Copy Evaluation</span>
                  )}
                </button>

                <button
                  onClick={() => handleCopyTaskId(task.task_id)}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Copy task ID"
                >
                  {copiedTaskIds.has(task.task_id) ? (
                    <Check className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-200" />
                  )}
                </button>

                <Link href={`/tasks?taskId=${task.task_id}`}>
                  <button
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-200" />
                  </button>
                </Link>
              </div>
            </div>
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

          {/* Expert Opinion */}
          {task.expert_opinion && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  Expert Evaluation
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-green-800">
                    Evaluator:{" "}
                  </span>
                  <span className="text-green-700">
                    {task.expert_opinion.assigned_preference_chooser}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-800">
                    Choice:{" "}
                  </span>
                  <span className="text-green-700">
                    {task.expert_opinion.preference_choice}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-800">
                    Strength:{" "}
                  </span>
                  <span className="text-green-700">
                    {task.expert_opinion.preference_strength}
                  </span>
                </div>
                {task.expert_opinion.preference_justification && (
                  <div>
                    <div className="text-sm font-medium text-green-800 mb-1">
                      Justification:
                    </div>
                    <p className="text-green-700 text-sm leading-relaxed">
                      {task.expert_opinion.preference_justification}
                    </p>
                  </div>
                )}
                {task.expert_opinion.assigned_reviewer && (
                  <div>
                    <span className="text-sm font-medium text-green-800">
                      Reviewer:{" "}
                    </span>
                    <span className="text-green-700">
                      {task.expert_opinion.assigned_reviewer}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duplicates */}
          {task.duplicates && task.duplicates.length > 0 && (
            <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Duplicate Tasks ({task.duplicates.length})
                </span>
              </div>
              <div className="space-y-4">
                {task.duplicates.map((duplicate, idx) => (
                  <div
                    key={duplicate.task_id}
                    className="bg-white p-3 rounded border border-orange-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-xs text-orange-700 break-all flex-1">
                          {duplicate.task_id}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleCopyTaskId(duplicate.task_id)}
                            className="p-1 hover:bg-orange-100 rounded transition-colors"
                            title="Copy task ID"
                          >
                            {copiedTaskIds.has(duplicate.task_id) ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-orange-600" />
                            )}
                          </button>
                          <Link href={`/tasks?taskId=${duplicate.task_id}`}>
                            <button
                              className="p-1 hover:bg-orange-100 rounded transition-colors"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3 h-3 text-orange-600" />
                            </button>
                          </Link>
                        </div>
                      </div>
                      <span className="text-xs bg-orange-100 px-2 py-1 rounded text-orange-700 flex-shrink-0">
                        Duplicate #{idx + 1}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-orange-800">
                          Evaluator:{" "}
                        </span>
                        <span className="text-orange-700">
                          {duplicate.expert_opinion.assigned_preference_chooser}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-orange-800">
                          Choice:{" "}
                        </span>
                        <span className="text-orange-700">
                          {duplicate.expert_opinion.preference_choice}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-orange-800">
                          Strength:{" "}
                        </span>
                        <span className="text-orange-700">
                          {duplicate.expert_opinion.preference_strength}
                        </span>
                      </div>
                      {duplicate.expert_opinion.preference_justification && (
                        <div>
                          <div className="font-medium text-orange-800 mb-1">
                            Justification:
                          </div>
                          <p className="text-orange-700 text-xs leading-relaxed">
                            {duplicate.expert_opinion.preference_justification}
                          </p>
                        </div>
                      )}

                      {/* Reviewer Information */}
                      {duplicate.expert_opinion.assigned_reviewer && (
                        <div className="border-t border-orange-200 pt-2 mt-2">
                          <div>
                            <span className="font-medium text-orange-800">
                              Reviewer:{" "}
                            </span>
                            <span className="text-orange-700">
                              {duplicate.expert_opinion.assigned_reviewer}
                            </span>
                          </div>
                          {duplicate.expert_opinion.review && (
                            <div>
                              <span className="font-medium text-orange-800">
                                Decision:{" "}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  duplicate.expert_opinion.review
                                    .toLowerCase()
                                    .includes("agree")
                                    ? "bg-green-100 text-green-700"
                                    : duplicate.expert_opinion.review
                                        .toLowerCase()
                                        .includes("disagree")
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {duplicate.expert_opinion.review}
                              </span>
                            </div>
                          )}
                          {duplicate.expert_opinion
                            .justification_for_review && (
                            <div>
                              <div className="font-medium text-orange-800 mb-1">
                                Review Justification:
                              </div>
                              <p className="text-orange-700 text-xs leading-relaxed">
                                {
                                  duplicate.expert_opinion
                                    .justification_for_review
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {task.reasoning && (
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800">
                  Original Reasoning
                </span>
              </div>
              <p className="text-amber-800 leading-relaxed">{task.reasoning}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Prompt */}
        {task.prompt && (
          <CollapsibleSection
            title="Original Prompt"
            sectionKey={`prompt-${index}`}
            isCollapsed={collapsedSections[`prompt-${index}`] ?? false}
            onToggle={onToggleSection}
            icon={<MessageSquare className="w-5 h-5" />}
            badge="Initial Request"
            badgeColor="bg-blue-100 text-blue-800"
          >
            <ConversationDisplay content={task.prompt} />
          </CollapsibleSection>
        )}

        {/* Last Human Message */}
        {task.last_human_message &&
          task.last_human_message !== task.prompt.replace("Human: ", "") && (
            <CollapsibleSection
              title="Latest Follow-up"
              sectionKey={`last-human-${index}`}
              isCollapsed={collapsedSections[`last-human-${index}`] ?? false}
              onToggle={onToggleSection}
              icon={<User className="w-5 h-5" />}
              badge="Human Message"
              badgeColor="bg-green-100 text-green-800"
            >
              <ConversationDisplay content={task.last_human_message} />
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
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 border-b border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded text-xs font-bold flex items-center justify-center flex-shrink-0">
                      A
                    </div>
                    Response A
                  </h4>
                </div>
              </div>
              <div className="p-4">
                <ResponseDisplay title="" response={task.response_A} />
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-50 border-b border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-green-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 text-white rounded text-xs font-bold flex items-center justify-center flex-shrink-0">
                      B
                    </div>
                    Response B
                  </h4>
                </div>
              </div>
              <div className="p-4">
                <ResponseDisplay title="" response={task.response_B} />
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};
