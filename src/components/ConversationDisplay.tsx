import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ConversationPart } from "../types";
import type { Components } from "react-markdown";

interface ConversationDisplayProps {
  content: string;
}

const markdownComponents: Components = {
  code: ({ children, ...props }) => {
    const isInline = !props.className?.includes("language-");
    if (isInline) {
      return (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg border overflow-x-auto">
        <code {...props}>{children}</code>
      </pre>
    );
  },
};

const parseConversation = (text: string): ConversationPart[] => {
  if (!text) return [];

  // Split by H: or Human: or Assistant: markers
  const parts = text.split(/(?=(?:H:|Human:|Assistant:))/);
  const conversation: ConversationPart[] = [];

  parts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("H:") || trimmed.startsWith("Human:")) {
      const content = trimmed.replace(/^(?:H:|Human:)\s*/, "").trim();
      if (content) {
        conversation.push({ speaker: "Human", content });
      }
    } else if (trimmed.startsWith("Assistant:")) {
      const content = trimmed.replace(/^Assistant:\s*/, "").trim();
      if (content) {
        conversation.push({ speaker: "Assistant", content });
      }
    } else {
      // If no marker, treat as continuation or standalone content
      if (conversation.length > 0) {
        conversation[conversation.length - 1].content += "\n\n" + trimmed;
      } else {
        conversation.push({ speaker: "Human", content: trimmed });
      }
    }
  });

  return conversation;
};

export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  content,
}) => {
  const conversation = parseConversation(content);

  if (conversation.length <= 1) {
    // Single part or no conversation markers, render as markdown
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversation.map((part, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border-l-4 ${
            part.speaker === "Human"
              ? "border-l-blue-400 "
              : "border-l-green-400 "
          }`}
        >
          <div className="font-semibold text-sm mb-2">{part.speaker}:</div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {part.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};
