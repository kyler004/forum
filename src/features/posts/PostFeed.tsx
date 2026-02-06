import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { Plus } from "lucide-react";

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
        <h2 className="text-2xl font-bold text-gray-900">
          {category
            ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
            : "Latest Discussions"}
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Post
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No posts found in this category.</p>
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
