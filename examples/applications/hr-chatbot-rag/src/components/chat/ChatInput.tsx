"use client";

import { useState } from "react";
import { Input, Button, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="p-8 bg-white border-t border-slate-50">
      <div className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="e.g. What is the parental leave policy?"
          size="large"
          disabled={disabled}
          style={{ borderRadius: 16, border: '1px solid #f1f5f9', background: '#f8fafc' }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={disabled}
          size="large"
          style={{ borderRadius: 16, width: 48, minWidth: 48 }}
        />
      </div>
      <div className="mt-4 text-center">
         <Text type="secondary" style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
           Encrypted Internal Communication
         </Text>
      </div>
    </div>
  );
}
