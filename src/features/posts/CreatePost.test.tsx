import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreatePost from "./CreatePost";

// Mock auth
vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user-id" } }),
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "new-post-id", title: "Test", content: "Content", category: "general" },
        error: null,
      }),
    })),
  },
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderCreatePost(overrides: Partial<{ onPostCreated: () => void; onClose: () => void }> = {}) {
  const props = {
    onPostCreated: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <CreatePost {...props} />
    </QueryClientProvider>
  );
  return props;
}

describe("CreatePost component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    renderCreatePost();
    expect(screen.getByText("Create New Post")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Content (Markdown supported)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post" })).toBeInTheDocument();
  });

  it("can type into title and content fields", () => {
    renderCreatePost();
    const titleInput = screen.getByLabelText("Title");
    const contentInput = screen.getByLabelText("Content (Markdown supported)");

    fireEvent.change(titleInput, { target: { value: "My awesome post" } });
    fireEvent.change(contentInput, { target: { value: "Some detailed content here." } });

    expect((titleInput as HTMLInputElement).value).toBe("My awesome post");
    expect((contentInput as HTMLTextAreaElement).value).toBe("Some detailed content here.");
  });

  it("calls onClose when Cancel is clicked", () => {
    const { onClose } = renderCreatePost();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onPostCreated and onClose after successful submit", async () => {
    const { onPostCreated, onClose } = renderCreatePost();

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByLabelText("Content (Markdown supported)"), {
      target: { value: "Test content" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => {
      expect(onPostCreated).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
