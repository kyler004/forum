import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import PostCard from "./PostCard";
import type { Post } from "./PostCard";

// Mock auth
vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

// Mock supabase (VoteControl uses it for realtime)
vi.mock("@/lib/supabase", () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnThis(),
      match: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

const mockPost: Post = {
  id: "post-1",
  title: "Understanding React Query",
  content: "TanStack Query makes data fetching simple.",
  category: "react",
  created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  profiles: {
    username: "testuser",
    avatar_url: null,
  },
  votes: [
    { user_id: "user-1", vote_type: 1 },
    { user_id: "user-2", vote_type: 1 },
    { user_id: "user-3", vote_type: -1 },
  ],
};

function renderPostCard(post: Post = mockPost) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <PostCard post={post} />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("PostCard component", () => {
  it("renders the post title", () => {
    renderPostCard();
    expect(screen.getByText("Understanding React Query")).toBeInTheDocument();
  });

  it("renders the author username", () => {
    renderPostCard();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("renders the category", () => {
    renderPostCard();
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  it("renders the correct vote score (1 + 1 - 1 = 1)", () => {
    renderPostCard();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders a Comments link to the post detail page", () => {
    renderPostCard();
    const commentsLink = screen.getByRole("link", { name: /comments/i });
    expect(commentsLink).toHaveAttribute("href", "/post/post-1");
  });

  it("renders correctly with no votes (score = 0)", () => {
    renderPostCard({ ...mockPost, votes: [] });
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
