import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import CommentSection from "@/features/comments/CommentSection";

interface PostDetails {
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

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            username,
            avatar_url
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Post not found</h2>
        <Link
          to="/"
          className="text-indigo-600 mt-4 inline-block hover:underline"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Feed
      </Link>

      <article className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-900">
            @{post.profiles.username}
          </span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
            })}
          </span>
          <span>•</span>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide">
            {post.category}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          {post.title}
        </h1>

        <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <CommentSection postId={post.id} />
    </div>
  );
}
