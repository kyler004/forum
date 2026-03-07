import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`public:comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const { data: comments = [], isLoading: loading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
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
        throw new Error(error.message);
      }
      return buildCommentTree(data || []);
    },
    enabled: !!postId,
  });

  const postCommentMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string | null; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("comments").insert({
        content,
        post_id: postId,
        author_id: user.id,
        parent_id: parentId,
      }).select().single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    }
  });

  const handlePostComment = async (
    parentId: string | null,
    content: string,
  ) => {
    postCommentMutation.mutate({ parentId, content });
  };

  const handleSubmitTopLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    postCommentMutation.mutate({ parentId: null, content: newComment });
    setNewComment("");
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
        Discussion
      </h3>

      {user ? (
        <form onSubmit={handleSubmitTopLevel} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 p-3 border transition-colors"
            placeholder="What are your thoughts?"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={postCommentMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-8 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          Please{" "}
          <a
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            sign in
          </a>{" "}
          to leave a comment.
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
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
