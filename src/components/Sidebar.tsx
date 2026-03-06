import { MessageSquare, Code, Briefcase, Terminal, Hash } from "lucide-react";

interface SidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
}: SidebarProps) {
  const categories = [
    { id: "all", name: "All Discussions", icon: MessageSquare },
    { id: "react", name: "React", icon: Code },
    { id: "javascript", name: "JavaScript", icon: Terminal },
    { id: "career", name: "Career", icon: Briefcase },
    { id: "general", name: "General", icon: Hash },
  ];

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-900 shadow-sm rounded-lg p-4 h-fit md:sticky md:top-4 border border-transparent dark:border-gray-800 transition-colors duration-300">
      <nav className="flex overflow-x-auto md:flex-col gap-2 md:gap-0 md:space-y-1 pb-2 md:pb-0 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive =
            category.id === "all"
              ? selectedCategory === null
              : selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() =>
                onSelectCategory(category.id === "all" ? null : category.id)
              }
              className={`md:w-full shrink-0 flex items-center px-4 py-2 md:py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
              />
              {category.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
