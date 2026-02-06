import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PostFeed from "@/features/posts/PostFeed";

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <aside className="w-full md:w-64 flex-shrink-0">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </aside>
      <div className="flex-1 w-full min-w-0">
        <PostFeed category={selectedCategory} />
      </div>
    </div>
  );
}
