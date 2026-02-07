import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/features/auth/useAuth";
import VoteControl from "@/components/VoteControl";

interface Vote {
  user_id: string;
  vote_type: number;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  votes?: Vote[];
  children?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  depth?: number;
}

export default function CommentItem({
  comment,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    await onReply(comment.id, replyContent);
    setIsSubmitting(false);
    setIsReplying(false);
    setReplyContent("");
  };

  // Prevent too much nesting indentation visually
  const maxIndentationDepth = 3;

  // Calculate score and user vote
  const score =
    comment.votes?.reduce((acc, vote) => acc + vote.vote_type, 0) || 0;
  const userVote =
    comment.votes?.find((v) => v.user_id === user?.id)?.vote_type || 0;

  return (
    <div className={`flex flex-col ${depth > 0 ? "mt-4" : ""}`}>
      <div className="flex gap-3">
        {/* Vote Control */}
        <div className="shrink-0 pt-1">
          <VoteControl
            id={comment.id}
            type="comment"
            initialScore={score}
            initialUserVote={userVote}
          />
        </div>

        {/* Avatar Placeholder */}
        <div className="shrink-0">
          <div
            className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold
                ${depth === 0 ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]"}`}
          >
            {comment.profiles.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <span className="font-semibold text-gray-900 mr-2">
              {comment.profiles.username}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="mt-1 text-sm text-gray-800 prose prose-sm max-w-none">
            <ReactMarkdown>{comment.content}</ReactMarkdown>
          </div>

          <div className="mt-2 flex items-center gap-4">
            {user && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <MessageSquare size={14} className="mr-1" />
                Reply
              </button>
            )}
          </div>

          {isReplying && (
            <form
              onSubmit={handleSubmitReply}
              className="mt-4 animate-fade-in-down"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px] p-2 border"
                autoFocus
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.children && comment.children.length > 0 && (
        <div
          className={`relative ${depth < maxIndentationDepth ? "ml-6 pl-4 border-l-2 border-gray-100" : "mt-2"}`}
        >
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
