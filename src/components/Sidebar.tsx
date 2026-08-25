"use client";

import { useState } from "react";
import { MessageSquare, Settings, User, Plus, LogOut, Trash2, X, Check, Sun, Moon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Sidebar({ 
  history, 
  onNewChat, 
  onSelectChat, 
  activeChatId,
  onDeleteChat,
  onDeleteAll,
  theme,
  onSetTheme
}: { 
  history: { id: string; title: string }[], 
  onNewChat: () => void,
  onSelectChat: (chatId: string) => void,
  activeChatId: string | null,
  onDeleteChat: (chatId: string) => void,
  onDeleteAll: () => void,
  theme: "light" | "dark",
  onSetTheme: (newTheme: "light" | "dark") => void
}) {
  const router = useRouter();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <aside className="w-72 h-screen bg-[#f3f0e9] dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 flex flex-col p-5 flex-shrink-0 sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2 mt-2">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 italic">Clone.AI</h1>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all mb-8 text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md font-semibold"
        >
          <Plus size={20} className="text-amber-600" />
          <span className="text-sm">Start New Chat</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">History</p>
            {history.length > 0 && (
              <div className="flex items-center gap-2">
                {!showConfirmClear ? (
                  <button 
                    onClick={() => setShowConfirmClear(true)}
                    className="text-[10px] font-bold text-red-400 hover:text-red-500 uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={10} />
                    Clear
                  </button>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-1 duration-200">
                    <button 
                      onClick={() => {
                         onDeleteAll();
                         setShowConfirmClear(false);
                      }}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase flex items-center gap-1"
                      title="Confirm Delete All"
                    >
                      <Check size={10} /> Confirm
                    </button>
                    <button 
                      onClick={() => setShowConfirmClear(false)}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase flex items-center gap-1"
                      title="Cancel"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {history.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <MessageSquare size={32} className="text-gray-200 dark:text-gray-800" />
                <p className="text-xs text-gray-400 px-2 italic">Your chat history will appear here</p>
             </div>
          ) : (
            history.map((chat) => (
              <div key={chat.id} className="group relative">
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left p-3 text-sm rounded-xl truncate transition-all flex items-center gap-3 pr-10 ${
                    activeChatId === chat.id 
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 font-semibold border border-amber-200 dark:border-amber-800/50" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <MessageSquare size={16} className={`${activeChatId === chat.id ? "text-amber-600" : "text-gray-400 group-hover:text-amber-600"} transition-colors`} />
                  <span className="truncate">{chat.title || "Untitled Chat"}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-6 space-y-2 mb-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-3 w-full p-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            <Settings size={18} />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 italic">Settings</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Appearance</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => onSetTheme("light")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group ${
                      theme === "light" 
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10" 
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${theme === "light" ? "bg-amber-100 text-amber-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                      <Sun size={24} />
                    </div>
                    <span className={`text-sm font-semibold ${theme === "light" ? "text-amber-900 dark:text-amber-100" : "text-gray-600 dark:text-gray-400"}`}>Light</span>
                  </button>
                  <button 
                    onClick={() => onSetTheme("dark")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group ${
                      theme === "dark" 
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10" 
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                      <Moon size={24} />
                    </div>
                    <span className={`text-sm font-semibold ${theme === "dark" ? "text-amber-900 dark:text-amber-100" : "text-gray-600 dark:text-gray-400"}`}>Dark</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">Clone.AI Premium Experience v1.2</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
