import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/useAuth";

interface VoteControlProps {
  id: string; // post_id or comment_id
  type: "post" | "comment";
  initialScore?: number; // Currently we might not have score in basic fetch, but let's support it if we add it
  initialUserVote?: number; // 1 for up, -1 for down, 0 for none
}

export default function VoteControl({
  id,
  type,
  initialScore = 0,
  initialUserVote = 0,
}: VoteControlProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);

  useEffect(() => {
    // If we only have initial props for score, Realtime might not update local state unless we refetch.
    // However, since we invalidate the query on success, the parent component refetches, sending new `initialScore`.
    // We just need to ensure the query client invalidates when other users vote.
    const channel = supabase
      .channel(`public:votes:${type}:${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `${type === "post" ? "post_id" : "comment_id"}=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: type === "post" ? ["posts"] : ["comments"] });
          if (type === "post") {
            queryClient.invalidateQueries({ queryKey: ["post", id] });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, type, queryClient]);

  // We use the initialScore from props (which is updated by React Query)
  // but if the user just voted, we want to show the optimistic update immediately.
  // A clean way to handle this without `useEffect` synchronization is to derive 
  // the displayed score/vote from props and a local "pending" state.
  // However, since we invalidate the query, `initialScore` will update shortly after.
  
  const [prevInitialScore, setPrevInitialScore] = useState(initialScore);

  if (initialScore !== prevInitialScore) {
    setPrevInitialScore(initialScore);
    setScore(initialScore);
    setUserVote(initialUserVote);
  }

  const voteMutation = useMutation({
    mutationFn: async ({ targetVote }: { targetVote: number }) => {
      if (!user) throw new Error("Not authenticated");
      
      if (targetVote === 0) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .match({
            user_id: user.id,
            [type === "post" ? "post_id" : "comment_id"]: id,
          });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("votes").upsert(
          {
            user_id: user.id,
            [type === "post" ? "post_id" : "comment_id"]: id,
            vote_type: targetVote,
          },
          {
            onConflict: `user_id, ${type === "post" ? "post_id" : "comment_id"}`,
          },
        );
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      // Background refetch to ensure consistency with other clients
      queryClient.invalidateQueries({ queryKey: type === "post" ? ["posts"] : ["comments"] });
      if (type === "post") {
          queryClient.invalidateQueries({ queryKey: ["post", id] });
      }
    },
    onError: (error) => {
      console.error("Voting failed:", error);
      // Revert optimization (context should theoretically contain them if we set it up in onMutate, 
      // but since we keep local state for score/vote, we could just rely on props reset or manual revert)
      // For a quick fix, if error, we don't have the previous values easily passing through context here without onMutate, 
      // but we can trust the queryClient invalidation will fix it eventually.
    }
  });

  const handleVote = async (newVote: number) => {
    if (!user) {
      alert("Please sign in to vote!");
      return;
    }
    if (voteMutation.isPending) return;

    // 1. Optimistic Update
    const previousVote = userVote;
    const previousScore = score;

    const targetVote = newVote === userVote ? 0 : newVote;
    const scoreChange = targetVote - previousVote;

    setUserVote(targetVote);
    setScore((prev) => prev + scoreChange);

    // 2. API Call via Mutation
    voteMutation.mutate({ targetVote }, {
      onError: () => {
        // Revert optimization
        setUserVote(previousVote);
        setScore(previousScore);
      }
    });
  };

  return (
    <div className="flex flex-col items-center shrink-0">
      <button
        onClick={() => handleVote(1)}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${userVote === 1 ? "text-orange-500" : "text-gray-400 dark:text-gray-500"}`}
        disabled={voteMutation.isPending}
      >
        <ChevronUp size={24} />
      </button>

      <span
        className={`text-sm font-bold ${userVote !== 0 ? (userVote === 1 ? "text-orange-500" : "text-indigo-500 dark:text-indigo-400") : "text-gray-700 dark:text-gray-300"}`}
      >
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${userVote === -1 ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
        disabled={voteMutation.isPending}
      >
        <ChevronDown size={24} />
      </button>
    </div>
  );
}
