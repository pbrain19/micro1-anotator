import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface ResponseDisplayProps {
  title: string;
  response: string;
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
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {response}
        </ReactMarkdown>
      </div>
    </div>
  );
};
