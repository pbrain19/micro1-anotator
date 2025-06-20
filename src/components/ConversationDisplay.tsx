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
  // First, handle single backticks that span multiple lines as code blocks
  // But be conservative - only if it looks like actual code content
  const processedContent = content.replace(
    /`([^`]+)`/g,
    (match, codeContent) => {
      // If the content contains newlines AND looks like code (has common code patterns)
      // and isn't too long (to avoid matching across conversation spans)
      if (
        codeContent.includes("\n") &&
        codeContent.length < 10000 && // Reasonable size limit
        (codeContent.includes("import") ||
          codeContent.includes("def ") ||
          codeContent.includes("class ") ||
          codeContent.includes("function") ||
          codeContent.includes("=") ||
          codeContent.includes("{") ||
          codeContent.includes("("))
      ) {
        return "\n```\n" + codeContent + "\n```\n";
      }
      // Otherwise, keep it as inline code
      return match;
    }
  );

  // Then handle both triple backticks (```) and triple single quotes (''') as code block delimiters
  const codeBlockRegex = /(```[\w]*[\s\S]*?```|'''[\w]*[\s\S]*?''')/g;
  const codeBlocks = processedContent.match(codeBlockRegex) || [];
  const textParts = processedContent.split(codeBlockRegex);

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
    } else if (part) {
      // Regular text - handle line breaks
      const lines = part.split("\n");
      lines.forEach((line, lineIndex) => {
        if (line) {
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

  // Only parse as conversation if there are clear conversation markers at the start of lines
  // and multiple conversation turns
  const conversationMarkers = text.match(/^(?:H:|Human:|Assistant:)/gm);

  // If there are fewer than 2 conversation markers, treat as regular content
  if (!conversationMarkers || conversationMarkers.length < 2) {
    return [];
  }

  // Split by H: or Human: or Assistant: markers at the start of lines
  const parts = text.split(/(?=^(?:H:|Human:|Assistant:))/gm);
  const conversation: ConversationPart[] = [];

  parts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    if (trimmed.match(/^(H:|Human:)/)) {
      const content = trimmed.replace(/^(?:H:|Human:)\s*/, "").trim();
      if (content) {
        conversation.push({ speaker: "Human", content });
      }
    } else if (trimmed.match(/^Assistant:/)) {
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
      {textParts
        .map((textPart, index) => {
          // Skip if this textPart is actually a code block (happens due to capture groups in split)
          if (
            textPart &&
            (textPart.startsWith("```") || textPart.startsWith("'''"))
          ) {
            return null;
          }

          return (
            <div key={index}>
              {textPart && textPart.trim() && (
                <p className="text-gray-700 leading-relaxed">
                  {renderTextWithInlineCode(textPart.trim())}
                </p>
              )}
              {codeBlocks[index] && (
                <CodeBlock
                  code={(() => {
                    const block = codeBlocks[index];
                    // Handle both ``` and ''' formats
                    let match = block.match(/```(\w*)\n?([\s\S]*?)```$/);
                    if (match) {
                      return match[2] || ""; // Return code content
                    }
                    match = block.match(/'''(\w*)\n?([\s\S]*?)'''$/);
                    if (match) {
                      return match[2] || ""; // Return code content
                    }
                    // Fallback - remove delimiters
                    return block
                      .replace(/(```\w*\n?|'''\w*\n?)/, "")
                      .replace(/(```|''')$/, "");
                  })()}
                  language={(() => {
                    const block = codeBlocks[index];
                    // Check for language in both formats
                    let match = block.match(/```(\w+)/);
                    if (match) return match[1];
                    match = block.match(/'''(\w+)/);
                    if (match) return match[1];
                    return "text";
                  })()}
                />
              )}
            </div>
          );
        })
        .filter(Boolean)}
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
