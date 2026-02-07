import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import VoteControl from "@/components/VoteControl";
import { useAuth } from "@/features/auth/AuthContext";

export interface Vote {
  user_id: string;
  vote_type: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  votes?: Vote[];
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();

  // Calculate score and user vote
  const score = post.votes?.reduce((acc, vote) => acc + vote.vote_type, 0) || 0;
  const userVote =
    post.votes?.find((v) => v.user_id === user?.id)?.vote_type || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors flex gap-4">
      {/* Vote Control - Left Side */}
      <div className="shrink-0 pt-1">
        <VoteControl
          id={post.id}
          type="post"
          initialScore={score}
          initialUserVote={userVote}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
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
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
            {post.category}
          </span>
        </div>

        <Link to={`/post/${post.id}`} className="block group">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 mb-2">
            {post.title}
          </h3>
          <div className="text-gray-600 line-clamp-3 prose prose-sm max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </Link>

        <div className="flex items-center mt-4 space-x-4 text-gray-500">
          <Link
            to={`/post/${post.id}`}
            className="flex items-center space-x-1 hover:bg-gray-50 px-2 py-1 rounded-md cursor-pointer transition-colors hover:text-indigo-600"
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">Comments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
