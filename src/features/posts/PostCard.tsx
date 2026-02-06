import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { MessageSquare, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Link } from "react-router-dom";

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
  // Future: votes, comment_count
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
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
            <div className="flex items-center space-x-1 hover:bg-gray-50 px-2 py-1 rounded-md cursor-pointer">
              <MessageSquare size={18} />
              <span className="text-sm font-medium">Comments</span>
            </div>
            {/* Future Vote Implementation */}
            <div className="flex items-center space-x-1">
              <button className="hover:text-orange-500 p-1">
                <ArrowBigUp size={20} />
              </button>
              <span className="text-sm font-medium">0</span>
              <button className="hover:text-blue-500 p-1">
                <ArrowBigDown size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
