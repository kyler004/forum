import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";

describe("Sidebar component", () => {
  it("renders correctly with categories", () => {
    const onSelectCategory = vi.fn();
    render(<Sidebar selectedCategory={null} onSelectCategory={onSelectCategory} />);
    
    expect(screen.getByText("All Discussions")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Career")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("calls onSelectCategory when a category is selected", () => {
    const onSelectCategory = vi.fn();
    render(<Sidebar selectedCategory={null} onSelectCategory={onSelectCategory} />);
    
    // Check React click
    fireEvent.click(screen.getByText("React"));
    expect(onSelectCategory).toHaveBeenCalledWith("react");

    // Click "All Discussions" maps to null
    fireEvent.click(screen.getByText("All Discussions"));
    expect(onSelectCategory).toHaveBeenCalledWith(null);
  });
});
