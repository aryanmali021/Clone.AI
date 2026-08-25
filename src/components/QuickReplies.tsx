"use client";

const languages = [
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "hi", name: "Hindi", flag: "🇮🇳" },
  { id: "hng", name: "Hinglish", flag: "🇮🇳" },
];

export default function QuickReplies({ onSelect }: { onSelect: (lang: string) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4 mb-4">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onSelect(lang.id)}
          className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <span>{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  );
}
