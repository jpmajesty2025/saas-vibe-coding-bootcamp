import type { Metadata } from "next";
import ChatInterface from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "Chat | VitalDocs AI",
  description: "Ask clinical questions powered by CDC guidelines.",
};

export default function ChatPage() {
  return <ChatInterface />;
}
