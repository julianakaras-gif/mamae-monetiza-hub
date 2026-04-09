import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageContentProps {
  content: string;
  role: "user" | "assistant";
}

const ChatMessageContent = ({ content, role }: ChatMessageContentProps) => {
  if (role === "user") {
    return <span>{content}</span>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ backgroundColor: "rgba(41,166,171,0.1)" }}>{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 text-xs font-bold text-foreground border-b border-border">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-sm text-foreground border-b border-border/50">
            {children}
          </td>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
        ),
        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        code: ({ children }) => (
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
        ),
        h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default ChatMessageContent;
