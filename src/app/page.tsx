"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import MessageList, { Message, Attachment } from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import QuickReplies from "@/components/QuickReplies";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 1. Initial Load from LocalStorage
    const savedTheme = localStorage.getItem("clone_ai_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // 2. React to theme state changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("clone_ai_theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleSetTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  useEffect(() => {
    // Temporarily bypassing Auth to focus on AI features
    const guestUser = { email: "guest@clone.ai", user_metadata: { full_name: "Guest User" }, id: "00000000-0000-0000-0000-000000000000" };
    setUser(guestUser);
    
    // Fetch and sync history
    const fetchHistory = async () => {
      // 1. Try Supabase
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          setHistory(data);
          return;
        }
      } catch (err) {
        console.error("Supabase history fetch error:", err);
      }

      // 2. Fallback to LocalStorage
      const localHistory = localStorage.getItem("clone_ai_history");
      if (localHistory) {
        setHistory(JSON.parse(localHistory));
      }
    };
    fetchHistory();
  }, [router]);

  const loadChat = async (chatId: string) => {
    setLoading(true);
    setMessages([]);
    setCurrentChatId(chatId);

    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('role, content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        setMessages(data as Message[]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Supabase messages fetch error:", err);
    }

    // 2. Fallback to LocalStorage
    const localMessages = localStorage.getItem(`clone_ai_messages_${chatId}`);
    if (localMessages) {
      setMessages(JSON.parse(localMessages));
    }
    setLoading(false);
  };

  const saveToLocalHistory = (chat: { id: string; title: string }) => {
    const localHistory = JSON.parse(localStorage.getItem("clone_ai_history") || "[]");
    if (!localHistory.find((c: any) => c.id === chat.id)) {
      const updatedHistory = [chat, ...localHistory];
      localStorage.setItem("clone_ai_history", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    }
  };

  const saveToLocalMessages = (chatId: string, messages: Message[]) => {
    localStorage.setItem(`clone_ai_messages_${chatId}`, JSON.stringify(messages));
  };

  const handleSendMessage = async (content: string, attachments?: Attachment[], isSearchEnabled?: boolean) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const userMessage: Message = { role: "user", content, attachments };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      let chatId = currentChatId;
      
      // 1. Handle Chat Record (Supabase + Local Fallback)
      if (!chatId) {
        const chatTitle = content.substring(0, 40) + (content.length > 40 ? "..." : "") || (attachments && attachments[0]?.name) || "New Chat";
        const tempId = crypto.randomUUID(); // Use native randomUUID

        try {
          const { data: chat, error: chatError } = await supabase
            .from('chats')
            .insert({ title: chatTitle, user_id: user?.id })
            .select().single();
          
          if (chat && !chatError) {
            chatId = chat.id;
            setHistory([chat, ...history]);
            saveToLocalHistory(chat);
          } else {
             // Fallback to local
             chatId = tempId;
             saveToLocalHistory({ id: chatId, title: chatTitle });
          }
        } catch (err) {
          chatId = tempId;
          saveToLocalHistory({ id: chatId, title: chatTitle });
        }
        setCurrentChatId(chatId);
      }

      // 2. Save Messages (Supabase + Local)
      const targetChatId = chatId; // Stable constant for TS
      if (targetChatId) {
        // Local Save
        saveToLocalMessages(targetChatId, newMessages);

        // Supabase Save (optional/bg)
        supabase.from('messages').insert({ chat_id: targetChatId, role: 'user', content, attachments }).then(({error}) => {
          if (error) console.error("Supabase msg save error:", error);
        });
      }

      // 3. API Call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language, attachments, isSearchEnabled }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `API error: ${response.status}`);

      if (data.content) {
        const assistantMessage: Message = { role: "assistant", content: data.content };
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);

        // Save Assistant Message
        if (chatId) {
          saveToLocalMessages(chatId, finalMessages);
          supabase.from('messages').insert({ chat_id: chatId, role: 'assistant', content: data.content }).then(({error}) => {
             if (error) console.error("Supabase assistant msg save error:", error);
          });
        }
      }
    } catch (error: any) {
      console.error("Chat API error:", error);
      setMessages([...newMessages, { role: "assistant", content: "Error: " + (error.message || "Something went wrong.") }]);
    } finally {
      setLoading(false);
    }
  };

  const isUUID = (id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setLanguage("en");
  };

  const handleDeleteChat = async (chatId: string) => {
    // 1. Update State
    const updatedHistory = history.filter(c => c.id !== chatId);
    setHistory(updatedHistory);
    
    if (currentChatId === chatId) {
      handleNewChat();
    }

    // 2. Update LocalStorage
    localStorage.setItem("clone_ai_history", JSON.stringify(updatedHistory));
    localStorage.removeItem(`clone_ai_messages_${chatId}`);

    // 3. Update Supabase (only if it's a real UUID)
    if (isUUID(chatId)) {
      try {
        const { error } = await supabase.from('chats').delete().eq('id', chatId);
        if (error) console.error("Supabase delete error:", error);
      } catch (err) {
        console.error("Supabase delete failed:", err);
      }
    }
  };

  const handleDeleteAllHistory = async () => {
    // 1. Reset State
    setHistory([]);
    handleNewChat();

    // 2. Clear LocalStorage
    localStorage.setItem("clone_ai_history", "[]");
    // Clear all message stores
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("clone_ai_messages_")) {
        localStorage.removeItem(key);
      }
    });

    // 3. Update Supabase
    try {
      const { error } = await supabase.from('chats').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all 
      // Note: RLS might prevent deleting others' chats if not guest, but for guest/public it's fine.
      if (error) console.error("Supabase clear error:", error);
    } catch (err) {
      console.error("Supabase clear failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#111111] overflow-hidden">
      <Sidebar 
        history={history} 
        onNewChat={handleNewChat} 
        onSelectChat={loadChat} 
        activeChatId={currentChatId} 
        onDeleteChat={handleDeleteChat}
        onDeleteAll={handleDeleteAllHistory}
        theme={theme}
        onSetTheme={handleSetTheme}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#fcfaf7] dark:bg-[#111111] relative">
        {/* Header decoration */}
        <header className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800/50 px-4 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-10">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Clone.AI v1.0</span>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        {loading && (
          <div className="absolute top-20 right-8 z-20">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold animate-pulse shadow-sm border border-amber-100 dark:border-amber-900/50">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Clone.AI is thinking...
            </div>
          </div>
        )}

        <footer className="p-4 bg-gradient-to-t from-[#fcfaf7] via-[#fcfaf7] to-transparent dark:from-[#111111] dark:via-[#111111] border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <QuickReplies onSelect={(lang) => setLanguage(lang)} />
            )}
            <ChatInput onSendMessage={handleSendMessage} />
            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
              Clone.AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
