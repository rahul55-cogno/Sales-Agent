import React, { useState } from "react";
import { Bot, User, Clock } from "lucide-react";

// --- Utility: linkify any text, making URLs blue/clickable ---
function linkify(content: any): React.ReactNode {
  if (typeof content === "string") {
    // Regex for URLs: https://...
    return content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
      /^https?:\/\/[^\s]+/.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 transition"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  } else if (Array.isArray(content)) {
    // Render arrays as bullets, linkify each item
    return (
      <ul className="list-disc pl-5 space-y-1">
        {content.map((item, idx) => (
          <li key={idx} className="text-sm">
            {linkify(item)}
          </li>
        ))}
      </ul>
    );
  } else if (typeof content === "object" && content !== null) {
    // Render objects as key: value blocks, linkify values
    return (
      <div>
        {Object.entries(content).map(([key, value], i) => (
          <div key={i} className="mb-1">
            <span className="font-medium capitalize">{key}:</span>{" "}
            <span>{linkify(value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// --- Expander for context objects; collapsed by default ---
function ContextExpander({ context }: { context: any }) {
  const [open, setOpen] = useState(false);
  const preview =
    JSON.stringify(context, null, 2)
      .split("\n")
      .slice(0, 6)
      .join("\n") + (Object.keys(context).length > 6 ? "\n..." : "");
  return (
    <div className="bg-blue-50 border border-blue-100 rounded px-2 py-1 text-xs font-mono text-gray-700 mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-blue-600 underline hover:text-blue-800 focus:outline-none mb-1"
        aria-expanded={open}
      >
        {open ? "Hide context ▲" : "Show full context ▼"}
      </button>
      <pre className="whitespace-pre-wrap mt-1 select-text transition-all max-h-72 overflow-auto">
        {open ? JSON.stringify(context, null, 2) : preview}
      </pre>
    </div>
  );
}

// --- Main chat message renderer ---
export const ChatMessage = ({ message }:{message:any}) => {
  const isBot = message.type === "bot";
  const isStatus = message.isStatus === true;

  // Special handling for context objects (with "context" field)
  if (
    typeof message.content === "object" &&
    message.content !== null &&
    "context" in message.content
  ) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex max-w-[80%]">
          {/* Bot avatar */}
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 text-gray-800 font-sans text-[15px] shadow-sm max-w-xs md:max-w-md">
            <div className="italic text-blue-700">
              I found some useful context for this conversation:
            </div>
            <ContextExpander context={message.content.context} />
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock size={12} className="mr-1" />
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Generic object/array/string auto rendering; linkification for all fields ---
  return (
    <div
      className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}
    >
      <div
        className={`flex max-w-[80%] ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isBot ? "mr-3" : "ml-3"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isBot ? "bg-blue-500" : "bg-gray-500"
            } text-white`}
          >
            {isBot ? <Bot size={16} /> : <User size={16} />}
          </div>
        </div>
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isBot
              ? "bg-white border border-gray-200 text-gray-800 font-sans"
              : "bg-blue-500 text-white font-medium"
          } max-w-xs md:max-w-md`}
          style={{
            fontStyle: isStatus ? "italic" : "normal",
            fontSize: isBot ? "15px" : "16px",
            color: isStatus ? "#6B7280" : undefined,
          }}
        >
          <div className="text-sm leading-relaxed break-words">
            {linkify(message.content)}
          </div>
          <div
            className={`flex items-center mt-2 text-xs ${
              isBot ? "text-gray-500" : "text-blue-100"
            }`}
          >
            <Clock size={12} className="mr-1" />
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
