"use client";

import { useState, useRef, useEffect } from "react";
import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { MessageSquare, Send, X, Sparkles, User, Bot, Loader2 } from "lucide-react";

interface AIChatWidgetProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

export function AIChatWidget({ data, style }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `Hi! I'm ${data.name}'s AI assistant. Ask me anything about their experience, skills, projects, or how to get in touch!`,
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      const responseText = getBotResponse(text);
      setMessages((prev) => [...prev, { sender: "bot", text: responseText }]);
      setIsTyping(false);
    }, 850);
  };

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Contact
    if (
      q.includes("contact") ||
      q.includes("email") ||
      q.includes("hire") ||
      q.includes("reach") ||
      q.includes("linkedin") ||
      q.includes("github") ||
      q.includes("phone")
    ) {
      const links = [];
      if (data.contact.email) links.push(`Email: ${data.contact.email}`);
      if (data.contact.linkedin) links.push(`LinkedIn: ${data.contact.linkedin}`);
      if (data.contact.github) links.push(`GitHub: ${data.contact.github}`);
      if (data.contact.website) links.push(`Website: ${data.contact.website}`);
      if (data.contact.phone) links.push(`Phone: ${data.contact.phone}`);

      return `Here are the best ways to get in touch with ${data.name}:\n\n${links.join("\n")}`;
    }

    // 2. Skills
    if (
      q.includes("skill") ||
      q.includes("tech") ||
      q.includes("language") ||
      q.includes("framework") ||
      q.includes("database") ||
      q.includes("stack")
    ) {
      const skillGroups = data.skills
        .map((g) => `• ${g.category}: ${g.items.join(", ")}`)
        .join("\n");
      return `Here is a summary of ${data.name}'s tech stack:\n\n${skillGroups}`;
    }

    // 3. Projects
    if (
      q.includes("project") ||
      q.includes("code") ||
      q.includes("work") && (q.includes("build") || q.includes("make")) ||
      q.includes("portfolio")
    ) {
      if (data.projects.length === 0) {
        return `${data.name} hasn't listed any featured projects yet.`;
      }
      const projectList = data.projects
        .slice(0, 3)
        .map((p) => `• ${p.name}: ${p.description} (${p.technologies.slice(0, 3).join(", ")})`)
        .join("\n\n");
      return `Here are some of ${data.name}'s featured projects:\n\n${projectList}${
        data.projects.length > 3 ? "\n\nAnd more listed on the portfolio above!" : ""
      }`;
    }

    // 4. Experience
    if (
      q.includes("experience") ||
      q.includes("job") ||
      q.includes("work") ||
      q.includes("career") ||
      q.includes("employ") ||
      q.includes("company")
    ) {
      if (data.experience.length === 0) {
        return `${data.name} is currently looking for entry-level opportunities or freelance roles.`;
      }
      const expList = data.experience
        .map((e) => `• ${e.role} at ${e.company} (${e.period})\n  ${e.description}`)
        .join("\n\n");
      return `Here is a snapshot of ${data.name}'s work experience:\n\n${expList}`;
    }

    // 5. Education
    if (
      q.includes("education") ||
      q.includes("school") ||
      q.includes("college") ||
      q.includes("degree") ||
      q.includes("study") ||
      q.includes("university")
    ) {
      if (data.education.length === 0) {
        return `${data.name} has not added education history yet.`;
      }
      const eduList = data.education
        .map((e) => `• ${e.degree} from ${e.institution} (${e.period})`)
        .join("\n");
      return `${data.name}'s academic history includes:\n\n${eduList}`;
    }

    // 6. Bio/About
    if (q.includes("about") || q.includes("who") || q.includes("bio") || q.includes("summary")) {
      return `About ${data.name}:\n\n${data.about}`;
    }

    // 7. Fallback response
    return `I can help you with questions about ${data.name}'s experience, skills, projects, and contact information. Feel free to click one of the quick options below, or rephrase your question.`;
  };

  // Styling maps based on style mode
  const isDev = style === "developer";
  const isCreative = style === "creative";

  let containerStyles = "bg-white text-zinc-900 border border-zinc-200 shadow-xl";
  let headerStyles = "bg-indigo-650 text-white";
  let botBubbleStyles = "bg-zinc-100 text-zinc-800 border border-zinc-200/50";
  let userBubbleStyles = "bg-indigo-600 text-white ml-auto";
  let buttonStyles = "bg-indigo-600 hover:bg-indigo-700 text-white";
  let tagStyles = "border border-zinc-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-zinc-600 hover:text-indigo-600";
  let toggleStyles = "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30";

  if (isDev) {
    containerStyles = "bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] shadow-[0_0_15px_rgba(56,139,250,0.1)] font-mono";
    headerStyles = "bg-[#161b22] text-[#f0f6fc] border-b border-[#30363d]";
    botBubbleStyles = "bg-[#161b22] text-[#8b949e] border border-[#30363d]";
    userBubbleStyles = "bg-[#1f6feb] text-white border border-[#388bfd] ml-auto";
    buttonStyles = "bg-[#238636] hover:bg-[#2ea043] text-white border border-[#2ea043]";
    tagStyles = "border border-[#30363d] bg-[#0d1117] text-[#58a6ff] hover:bg-[#161b22] hover:text-[#58a6ff]";
    toggleStyles = "bg-[#161b22] text-[#3fb950] border border-[#30363d] hover:bg-[#21262d] shadow-lg font-mono";
  } else if (isCreative) {
    containerStyles = "bg-[#121225]/95 text-purple-100 border border-purple-500/30 shadow-[0_0_25px_rgba(167,139,250,0.15)] backdrop-blur-md";
    headerStyles = "bg-gradient-to-r from-purple-700 to-pink-700 text-white";
    botBubbleStyles = "bg-[#201c3d] text-purple-200 border border-purple-500/20";
    userBubbleStyles = "bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-auto";
    buttonStyles = "bg-purple-600 hover:bg-purple-500 text-white";
    tagStyles = "border border-purple-500/25 bg-purple-500/5 text-purple-300 hover:bg-purple-500/15 hover:text-white";
    toggleStyles = "bg-gradient-to-tr from-purple-600 to-pink-600 text-white hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(167,139,250,0.4)]";
  }

  return (
    <div className="absolute bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen ? (
        <div className={`mb-4 flex h-[420px] w-[330px] flex-col overflow-hidden rounded-2xl ${containerStyles} transition-all duration-300 scale-100 origin-bottom-right animate-fade-in`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3.5 ${headerStyles}`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse text-indigo-300" />
              <span className="text-xs font-bold tracking-wide">
                {isDev ? `${data.name.split(" ")[0].toLowerCase()}_bot` : `${data.name.split(" ")[0]}'s Twin`}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages scrollarea */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                {msg.sender === "bot" && (
                  <div className={`p-1 rounded-full shrink-0 ${isDev ? "bg-[#30363d] text-[#3fb950]" : "bg-purple-500/10 text-purple-400"}`}>
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                {msg.sender === "user" && (
                  <div className="order-2 p-1 rounded-full shrink-0 bg-zinc-800 text-zinc-300">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-xl p-3 text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.sender === "bot" ? botBubbleStyles : userBubbleStyles
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-start">
                <div className={`p-1 rounded-full shrink-0 ${isDev ? "bg-[#30363d] text-[#3fb950]" : "bg-purple-500/10 text-purple-400"}`}>
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className={`rounded-xl p-3 text-xs ${botBubbleStyles} flex items-center gap-1.5`}>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Pills */}
          <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-zinc-200/15 bg-zinc-50/5">
            <button
              onClick={() => handleSend("Tell me about your tech stack")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer ${tagStyles}`}
            >
              🔧 Tech Stack
            </button>
            <button
              onClick={() => handleSend("What projects have you worked on?")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer ${tagStyles}`}
            >
              📁 Projects
            </button>
            <button
              onClick={() => handleSend("Summarize your professional experience")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer ${tagStyles}`}
            >
              💼 Experience
            </button>
            <button
              onClick={() => handleSend("How can I get in touch with you?")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer ${tagStyles}`}
            >
              ✉️ Contact
            </button>
          </div>

          {/* Text Input area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="flex border-t border-zinc-200/15 p-2 gap-2 bg-zinc-50/5"
          >
            <input
              type="text"
              placeholder="Ask me anything..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200/20 bg-zinc-50/10 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/60"
            />
            <button
              type="submit"
              className={`rounded-lg p-2 transition-all cursor-pointer ${buttonStyles}`}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : null}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 cursor-pointer ${toggleStyles}`}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>
    </div>
  );
}
