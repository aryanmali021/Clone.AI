"use client";

import { Send, Plus, Globe, X, Paperclip, Image as ImageIcon, Monitor, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Attachment } from "./MessageList";

export default function ChatInput({ 
  onSendMessage 
}: { 
  onSendMessage: (msg: string, attachments?: Attachment[], isSearchEnabled?: boolean) => void 
}) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments, isSearchEnabled);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
  };

  const processFiles = async (files: FileList | File[]) => {
    const newAttachments: Attachment[] = [...attachments];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 5MB.`);
        continue;
      }
      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onload = (event) => {
          if (event.target?.result) {
            newAttachments.push({
              data: event.target.result as string,
              mimeType: file.type,
              name: file.name
            });
          }
          resolve();
        };
      });
      reader.readAsDataURL(file);
      await promise;
    }
    setAttachments(newAttachments);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowMenu(false);
  };

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL("image/png");
      setAttachments([...attachments, {
        data: dataUrl,
        mimeType: "image/png",
        name: `Screenshot-${new Date().toLocaleTimeString()}.png`
      }]);
      
      stream.getTracks().forEach(track => track.stop());
      setShowMenu(false);
    } catch (err) {
      console.error("Screenshot capture failed:", err);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    setShowMenu(false);
    try {
      setTimeout(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      console.error("Camera access failed:", err);
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL("image/png");
      setAttachments([...attachments, {
        data: dataUrl,
        mimeType: "image/png",
        name: `Photo-${new Date().toLocaleTimeString()}.png`
      }]);
      closeCamera();
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-[2rem] shadow-xl focus-within:border-amber-400 dark:focus-within:border-amber-600 transition-all p-3 pl-5"
      >
        {/* Attachment Menu */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute bottom-full left-4 mb-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50 w-56 backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="flex items-center gap-3 w-full p-3 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-all text-gray-700 dark:text-gray-200"
            >
              <Paperclip size={18} className="text-amber-600" />
              <span className="font-medium text-sm">Upload photos & files</span>
            </button>
            <button
              onClick={takeScreenshot}
              type="button"
              className="flex items-center gap-3 w-full p-3 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-all text-gray-700 dark:text-gray-200"
            >
              <Monitor size={18} className="text-amber-600" />
              <span className="font-medium text-sm">Take screenshot</span>
            </button>
            <button
              onClick={openCamera}
              type="button"
              className="flex items-center gap-3 w-full p-3 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-all text-gray-700 dark:text-gray-200"
            >
              <Camera size={18} className="text-amber-600" />
              <span className="font-medium text-sm">Take photo</span>
            </button>
          </div>
        )}

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full relative">
              <button 
                onClick={closeCamera}
                className="absolute top-4 right-4 z-10 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all"
              >
                <X size={24} />
              </button>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover aspect-video" />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-all active:scale-90"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-lg" />
                </button>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700/50">
            {attachments.map((att, i) => (
              <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-sm">
                {att.mimeType.startsWith("image/") ? (
                  <img src={att.data} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-amber-50 dark:bg-amber-900/10">
                    <Paperclip size={20} className="text-amber-600 mb-1" />
                    <span className="text-[8px] truncate w-full text-gray-500 font-medium">{att.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="absolute top-1 right-1 bg-gray-900/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={attachments.length > 0 ? "Add a message about these files..." : "How can Clone.AI help you today?"}
          className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none min-h-[60px] max-h-[200px] overflow-y-auto block py-3 text-lg leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
          <div className="flex items-center gap-1">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf,.txt,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2.5 rounded-full transition-all ${showMenu ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 shadow-inner' : 'text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10'}`}
              title="Attach File"
            >
              <Plus size={22} className={`transition-transform duration-300 ${showMenu ? 'rotate-45' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsSearchEnabled(!isSearchEnabled)}
              className={`p-2.5 rounded-full transition-all ${isSearchEnabled ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 shadow-inner' : 'text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10'}`}
              title="Search Web"
            >
              <Globe size={22} />
            </button>
          </div>
          <button
            type="submit"
            disabled={!message.trim() && attachments.length === 0}
            className="p-3 bg-amber-600 dark:bg-amber-700 text-white rounded-2xl disabled:opacity-30 disabled:grayscale hover:bg-amber-700 dark:hover:bg-amber-600 transition-all shadow-lg shadow-amber-600/20 active:scale-95"
            title="Send Message"
          >
            <Send size={22} />
          </button>
        </div>
      </form>
    </div>
  );
}
