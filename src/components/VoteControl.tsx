import { useState } from "react";
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
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (newVote: number) => {
    if (!user) {
      alert("Please sign in to vote!");
      return;
    }
    if (isVoting) return;

    // 1. Optimistic Update
    const previousVote = userVote;
    const previousScore = score;

    // If clicking same vote again, toggle off (0)
    const targetVote = newVote === userVote ? 0 : newVote;

    // Calculate score change
    // Example: Old 0, New 1 => +1
    // Example: Old 1, New -1 => -2
    // Example: Old 1, New 0 => -1
    const scoreChange = targetVote - previousVote;

    setUserVote(targetVote);
    setScore((prev) => prev + scoreChange);
    setIsVoting(true);

    // 2. API Call
    try {
      if (targetVote === 0) {
        // Remove vote
        const { error } = await supabase
          .from("votes")
          .delete()
          .match({
            user_id: user.id,
            [type === "post" ? "post_id" : "comment_id"]: id,
          });

        if (error) throw error;
      } else {
        // Upsert vote
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

        if (error) throw error;
      }
    } catch (error) {
      console.error("Voting failed:", error);
      // Revert optimization
      setUserVote(previousVote);
      setScore(previousScore);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center mr-4">
      <button
        onClick={() => handleVote(1)}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${userVote === 1 ? "text-orange-500" : "text-gray-400 dark:text-gray-500"}`}
        disabled={isVoting}
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
        disabled={isVoting}
      >
        <ChevronDown size={24} />
      </button>
    </div>
  );
}
