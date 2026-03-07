import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import VoteControl from "./VoteControl";

// Mock Query Client context for Testing
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Mock our custom auth hook
vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

// Mock Supabase
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

describe("VoteControl component", () => {
  const renderVoteControl = (props: any) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <VoteControl {...props} />
      </QueryClientProvider>
    );
  };

  it("renders with initial score", () => {
    renderVoteControl({ id: "1", type: "post", initialScore: 42, initialUserVote: 0 });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("optimistically updates score on upvote", async () => {
    renderVoteControl({ id: "2", type: "post", initialScore: 10, initialUserVote: 0 });
    
    // Initial state
    expect(screen.getByText("10")).toBeInTheDocument();

    // Find and click the upvote button (ChevronUp). It's the first button
    const buttons = screen.getAllByRole("button");
    const upvoteButton = buttons[0];

    fireEvent.click(upvoteButton);

    // Should immediately change to 11
    expect(await screen.findByText("11")).toBeInTheDocument();
  });
});
