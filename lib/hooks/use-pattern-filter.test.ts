import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { Pattern } from "@/lib/types";
import { usePatternFilter } from "./use-pattern-filter";

// Mock Data
const mockPatterns: Pattern[] = [
  {
    id: 1,
    pattern: "Avoid default exports",
    category: "convention",
    description: "Use named exports instead.",
    createdAt: new Date(),
  },
  {
    id: 2,
    pattern: "Check for hydration errors",
    category: "gotcha",
    description: "Ensure server and client render match.",
    createdAt: new Date(),
  },
  {
    id: 3,
    pattern: "Use standard convention",
    category: "convention",
    description: "Follow the style guide.",
    createdAt: new Date(),
  },
];

describe("usePatternFilter", () => {
  it("should return all patterns initially", () => {
    const { result } = renderHook(() => usePatternFilter(mockPatterns));
    expect(result.current.filteredPatterns).toHaveLength(3);
  });

  it("should filter by search query (case insensitive)", () => {
    const { result } = renderHook(() => usePatternFilter(mockPatterns));

    act(() => {
      result.current.setSearchQuery("avoid");
    });

    expect(result.current.filteredPatterns).toHaveLength(1);
    expect(result.current.filteredPatterns[0].pattern).toBe(
      "Avoid default exports",
    );
  });

  it("should filter by category", () => {
    const { result } = renderHook(() => usePatternFilter(mockPatterns));

    act(() => {
      result.current.setSelectedCategory("gotcha");
    });

    expect(result.current.filteredPatterns).toHaveLength(1);
    expect(result.current.filteredPatterns[0].category).toBe("gotcha");
  });

  it("should filter by both search query and category", () => {
    const { result } = renderHook(() => usePatternFilter(mockPatterns));

    act(() => {
      result.current.setSearchQuery("convention");
      result.current.setSelectedCategory("convention");
    });

    // "Use standard convention" matches both category "convention" and text "convention"
    // "Avoid default exports" matches category "convention" but NOT text "convention" (in pattern name, though strictly substring search might vary depending on implementation intent.
    // Let's assume we search in pattern name.
    // Search: "convention" -> matches "Use standard convention"
    // Category: "convention" -> matches both #1 and #3.
    // Intersection -> "Use standard convention"

    expect(result.current.filteredPatterns).toHaveLength(1);
    expect(result.current.filteredPatterns[0].pattern).toBe(
      "Use standard convention",
    );
  });

  it("should handle empty results", () => {
    const { result } = renderHook(() => usePatternFilter(mockPatterns));

    act(() => {
      result.current.setSearchQuery("xyz_non_existent");
    });

    expect(result.current.filteredPatterns).toHaveLength(0);
  });
});
