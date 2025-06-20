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
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const textParts = content.split(/```[\s\S]*?```/);

  return { codeBlocks, textParts };
};

const renderTextWithInlineCode = (text: string) => {
  // Split by inline code blocks
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      // This is inline code
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-sm inline"
        >
          {code}
        </code>
      );
    } else {
      // Regular text - split by line breaks and render as paragraphs
      return part
        .split("\n")
        .map((line, lineIndex) => {
          if (line.trim()) {
            return (
              <p
                key={`${index}-${lineIndex}`}
                className="mb-2 text-gray-700 leading-relaxed"
              >
                {line}
              </p>
            );
          }
          return null;
        })
        .filter(Boolean);
    }
  });
};

const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const { codeBlocks, textParts } = parseContent(content);

  return (
    <div className="space-y-4">
      {textParts.map((textPart, index) => (
        <div key={index}>
          {textPart.trim() && (
            <div className="space-y-2">
              {renderTextWithInlineCode(textPart.trim())}
            </div>
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
