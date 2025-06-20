import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ResponseDisplayProps {
  title: string;
  response: string;
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
  // Handle both triple backticks (```) and triple single quotes (''') as code block delimiters
  const codeBlockRegex = /(```[\w]*[\s\S]*?```|'''[\w]*[\s\S]*?''')/g;
  const codeBlocks = content.match(codeBlockRegex) || [];
  const textParts = content.split(codeBlockRegex);

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

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  title,
  response,
}) => {
  if (!response) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg font-medium mb-2">No response available</div>
        <div className="text-sm">This response field is empty.</div>
      </div>
    );
  }

  return (
    <div className="response-display">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          {title}
        </h3>
      )}
      <div className="bg-white rounded-lg">
        <ContentRenderer content={response} />
      </div>
    </div>
  );
};
