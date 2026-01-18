"use client";

import { Avatar } from "antd";
import { RobotOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | null;
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar 
        size={36} 
        icon={isUser ? <UserOutlined /> : <RobotOutlined />} 
        style={{ 
          backgroundColor: isUser ? "#f1f5f9" : "#33993310", 
          color: isUser ? "#64748b" : "#339933" 
        }}
      />
      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-[14px] leading-relaxed ${
        isUser 
          ? "bg-slate-900 text-white rounded-tr-none" 
          : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
      }`}>
        {isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || ""}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
