import React, { useState } from "react";
import { ConversationPart } from "../types";
import { Copy, Check, User, Bot } from "lucide-react";

interface ConversationDisplayProps {
  content: string;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({
  code,
  language = "text",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      python: "bg-blue-500",
      javascript: "bg-yellow-500",
      typescript: "bg-blue-600",
      ruby: "bg-red-500",
      java: "bg-orange-500",
      cpp: "bg-purple-500",
      c: "bg-gray-500",
      go: "bg-cyan-500",
      rust: "bg-orange-600",
      php: "bg-indigo-500",
    };
    return colors[lang.toLowerCase()] || "bg-gray-500";
  };

  return (
    <div className="relative my-4">
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-sm">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`}
          ></div>
          <span className="font-mono text-xs uppercase tracking-wide">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 transition-colors opacity-80 hover:opacity-100"
          type="button"
        >
          {copied ? (
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
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono leading-relaxed border-t border-gray-700">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const parseContent = (content: string) => {
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const textParts = content.split(/```[\s\S]*?```/);

  return { codeBlocks, textParts };
};

const renderTextWithInlineCode = (text: string) => {
  // Split by inline code blocks while preserving the text structure
  const parts = text.split(/(`[^`]+`)/g);

  const elements: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      // This is inline code
      const code = part.slice(1, -1);
      elements.push(
        <code
          key={index}
          className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-sm mx-1 inline-block"
        >
          {code}
        </code>
      );
    } else if (part.trim()) {
      // Regular text - preserve line breaks but keep inline flow
      const lines = part.split("\n");
      lines.forEach((line, lineIndex) => {
        if (line.trim()) {
          elements.push(<span key={`${index}-${lineIndex}`}>{line}</span>);
        }
        // Add line break if not the last line
        if (lineIndex < lines.length - 1) {
          elements.push(<br key={`${index}-br-${lineIndex}`} />);
        }
      });
    }
  });

  return elements;
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

const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const { codeBlocks, textParts } = parseContent(content);

  return (
    <div className="space-y-4">
      {textParts.map((textPart, index) => (
        <div key={index}>
          {textPart.trim() && (
            <p className="text-gray-700 leading-relaxed">
              {renderTextWithInlineCode(textPart.trim())}
            </p>
          )}
          {codeBlocks[index] && (
            <CodeBlock
              code={codeBlocks[index]
                .replace(/```\w*\n?/, "")
                .replace(/```$/, "")}
              language="text"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  content,
}) => {
  const conversation = parseConversation(content);

  if (conversation.length <= 1) {
    // Single part or no conversation markers, render as custom content
    return (
      <div className="bg-white rounded-lg p-6 conversation-display">
        <ContentRenderer content={content} />
      </div>
    );
  }

  return (
    <div className="space-y-4 conversation-display">
      {conversation.map((part, index) => (
        <div
          key={index}
          className={`rounded-lg border-2 shadow-sm ${
            part.speaker === "Human"
              ? "border-blue-200 bg-blue-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 border-b ${
              part.speaker === "Human"
                ? "border-blue-200 bg-blue-100"
                : "border-green-200 bg-green-100"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                part.speaker === "Human"
                  ? "bg-blue-600 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {part.speaker === "Human" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div className="font-semibold text-sm">
              {part.speaker === "Human" ? "Human" : "Assistant"}
            </div>
          </div>
          <div className="p-4">
            <ContentRenderer content={part.content} />
          </div>
        </div>
      ))}
    </div>
  );
};
