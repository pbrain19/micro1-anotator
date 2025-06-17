import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";

interface ResponseDisplayProps {
  title: string;
  response: string;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [copied, setCopied] = useState(false);
  const codeString = Array.isArray(children)
    ? children.join("")
    : String(children);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-80 hover:opacity-100 transition"
        type="button"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg border overflow-x-auto whitespace-pre-wrap">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const markdownComponents: Components = {
  code: (props) => {
    // @ts-expect-error: inline is present in props at runtime
    if (props.inline) {
      return (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
          {props.children}
        </code>
      );
    }
    return <CodeBlock>{props.children}</CodeBlock>;
  },
};

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  title,
  response,
}) => {
  if (!response) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={markdownComponents}
        >
          {response}
        </ReactMarkdown>
      </div>
    </div>
  );
};
