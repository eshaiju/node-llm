"use client";

import { Avatar, Typography, Space, Badge } from "antd";
import { RobotOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

export function ChatHeader() {
  return (
    <div className="px-8 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
      <Space size="middle">
        <Avatar 
          size={44} 
          icon={<RobotOutlined />} 
          style={{ backgroundColor: "#339933" }}
          className="shadow-lg shadow-brand-primary/20"
        />
        <div className="flex flex-col">
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>HR Assistant</Title>
          <Space size={4} align="center">
            <Badge status="processing" color="#10b981" />
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>SECURE SESSION</Text>
          </Space>
        </div>
      </Space>
      <Badge count="PREMIUM" style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #f1f5f9', fontWeight: 800, fontSize: 10 }} />
    </div>
  );
}
