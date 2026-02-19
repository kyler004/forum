import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all ${
          theme === "light"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-full transition-all ${
          theme === "system"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="System Preference"
      >
        <Monitor size={16} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all ${
          theme === "dark"
            ? "bg-gray-700 text-indigo-400 shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
