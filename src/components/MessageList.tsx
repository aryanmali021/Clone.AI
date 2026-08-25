"use client";

import ReactMarkdown from "react-markdown";
import { User, Sparkles, Paperclip } from "lucide-react";

export interface Attachment {
  data: string; // base64
  mimeType: string;
  name: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

export default function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[400px]">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 shadow-sm border border-amber-100 dark:border-amber-900/50">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Meet Clone.AI</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md font-medium">Your premium AI companion. Ask me anything in English, Hindi, or Hinglish.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-4 md:p-8 max-w-4xl mx-auto w-full pb-32">
      {messages.map((msg, idx) => (
        <div key={idx} className={`flex gap-5 md:gap-8 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.role === "user" ? "bg-amber-600 text-white border-amber-700" : "bg-white dark:bg-gray-800 text-amber-600 border-gray-100 dark:border-gray-700"}`}>
            {msg.role === "user" ? <User size={20} /> : <Sparkles size={20} />}
          </div>
          <div className={`flex-1 overflow-hidden space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`prose dark:prose-invert max-w-none inline-block text-gray-800 dark:text-gray-200 leading-relaxed ${msg.role === 'user' ? 'bg-amber-100/50 dark:bg-amber-900/10 px-5 py-3 rounded-2xl rounded-tr-none border border-amber-200/50 dark:border-amber-900/30 shadow-sm' : ''}`}>
               <ReactMarkdown>{msg.content}</ReactMarkdown>
               
               {msg.attachments && msg.attachments.length > 0 && (
                 <div className={`flex flex-wrap gap-2 mt-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.attachments.map((att, i) => (
                     <div key={i} className="max-w-[240px] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 shadow-sm transition-transform hover:scale-[1.02]">
                       {att.mimeType.startsWith("image/") ? (
                         <img 
                            src={att.data} 
                            alt={att.name} 
                            className="w-full h-auto object-cover max-h-48 cursor-pointer"
                            onClick={() => window.open(att.data, '_blank')}
                         />
                       ) : (
                         <div className="p-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 min-w-[160px]">
                           <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                             <Paperclip size={16} />
                           </div>
                           <span className="truncate font-medium">{att.name}</span>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
