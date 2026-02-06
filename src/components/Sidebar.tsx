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
    <div className="w-64 bg-white shadow-sm rounded-lg p-4 h-fit sticky top-4">
      <nav className="space-y-1">
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
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
              />
              {category.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
