import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { Plus } from "lucide-react";
import Skeleton from "@/components/Skeleton";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface PostFeedProps {
  category: string | null;
}

export default function PostFeed({ category }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let query = supabase.from("posts").select(
        `
          *,
          profiles (
            username,
            avatar_url
          )
        `,
      );

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .returns<Post[]>();

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [category]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {category
            ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
            : "Latest Discussions"}
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Post
        </button>
      </div>
      {/* import Skeleton from "@/components/Skeleton"; // ... existing code ... */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 space-y-4"
            >
              <div className="flex justify-between">
                <Skeleton className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700" />
              </div>
              <Skeleton className="w-3/4 h-8 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="w-full h-16 bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No posts found in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      {isCreateModalOpen && (
        <CreatePost
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={() => {
            // To trigger a refetch, we might need to lift state or use a query library (TanStack Query).
            // For now, we can just reload the page or add a simple refresh trigger.
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
