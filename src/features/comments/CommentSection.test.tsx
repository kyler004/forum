import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CommentSection from "./CommentSection";

// Mock auth — authenticated user
vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

// Mock supabase — returns empty comments list
vi.mock("@/lib/supabase", () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      returns: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "cmt-1" }, error: null }),
    })),
  },
}));

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderCommentSection(postId = "post-1") {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <CommentSection postId={postId} />
    </QueryClientProvider>
  );
}

describe("CommentSection component", () => {
  it("renders the Discussion heading", () => {
    renderCommentSection();
    expect(screen.getByText("Discussion")).toBeInTheDocument();
  });

  it("renders the comment textarea for authenticated users", () => {
    renderCommentSection();
    expect(
      screen.getByPlaceholderText("What are your thoughts?")
    ).toBeInTheDocument();
  });

  it("renders the Post Comment submit button", () => {
    renderCommentSection();
    expect(screen.getByRole("button", { name: "Post Comment" })).toBeInTheDocument();
  });

  it("shows no comments message when list is empty", async () => {
    renderCommentSection();
    // After the query resolves (mocked to return []), we expect the empty state
    expect(
      await screen.findByText("No comments yet. Be the first to share your thoughts!")
    ).toBeInTheDocument();
  });
});

describe("CommentSection — unauthenticated", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("shows sign-in prompt when user is null", async () => {
    // Re-mock useAuth to return null user for this test
    vi.doMock("@/features/auth/useAuth", () => ({
      useAuth: () => ({ user: null }),
    }));

    // Dynamic import so the re-mock takes effect
    const { default: CommentSectionGuest } = await import("./CommentSection");

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <CommentSectionGuest postId="post-2" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});
