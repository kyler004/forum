import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/useAuth";
import CommentItem from "./CommentItem";
import type { Comment } from "./CommentItem";

interface CommentSectionProps {
  postId: string;
}

// Helper function to build tree
const buildCommentTree = (flatComments: Comment[]): Comment[] => {
  const commentMap: { [key: string]: Comment } = {};
  const rootComments: Comment[] = [];

  // Initialize map
  flatComments.forEach((c) => {
    commentMap[c.id] = { ...c, children: [] };
  });

  // Build hierarchy
  flatComments.forEach((c) => {
    if (c.parent_id) {
      if (commentMap[c.parent_id]) {
        commentMap[c.parent_id].children?.push(commentMap[c.id]);
      }
    } else {
      rootComments.push(commentMap[c.id]);
    }
  });

  return rootComments;
};

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Define fetchComments at module level or use useCallback, but here we can just put it inside or use the standalone helper.
  // Actually, for simplicity and to avoid dependency cycles, let's keep fetch logic simple.

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
            *,
            profiles (
              username,
              avatar_url
            )
          `,
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
        .returns<Comment[]>();

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        const tree = buildCommentTree(data || []);
        setComments(tree);
      }
      setLoading(false);
    };

    fetchComments();
  }, [postId, refreshKey]);

  const handlePostComment = async (
    parentId: string | null,
    content: string,
  ) => {
    if (!user) return;

    // Optimistic update could be added here, but for now we wait for server
    const { error } = await supabase.from("comments").insert({
      content,
      post_id: postId,
      author_id: user.id,
      parent_id: parentId,
    });

    if (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    } else {
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleSubmitTopLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await handlePostComment(null, newComment);
    setNewComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Discussion</h3>

      {user ? (
        <form onSubmit={handleSubmitTopLevel} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
            placeholder="What are your thoughts?"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md mb-8 text-sm text-gray-600">
          Please{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            sign in
          </a>{" "}
          to leave a comment.
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-500">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(parentId, content) =>
                handlePostComment(parentId, content)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
