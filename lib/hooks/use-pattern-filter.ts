import { useMemo, useState } from "react";
import { Pattern, PatternCategory } from "@/lib/types";

interface UsePatternFilterResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: PatternCategory | null;
  setSelectedCategory: (category: PatternCategory | null) => void;
  filteredPatterns: Pattern[];
}

export function usePatternFilter(patterns: Pattern[]): UsePatternFilterResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<PatternCategory | null>(null);

  const filteredPatterns = useMemo(() => {
    return patterns.filter((pattern) => {
      // 1. Filter by Category
      if (selectedCategory && pattern.category !== selectedCategory) {
        return false;
      }

      // 2. Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = pattern.pattern.toLowerCase().includes(query);
        const matchesDescription = pattern.description
          .toLowerCase()
          .includes(query);

        // As per test requirement "Use standard convention" matches "convention"
        // Let's being inclusive and search in name and description.
        // And also strictly the category name itself?
        // "Use standard convention" (name) matches "convention" (query)
        // "Avoid default exports" (name) does not match "convention" (query), but category is convention.
        // Usually search query implies text search on content.
        // The test comment said:
        // // Search: "convention" -> matches "Use standard convention"
        // // Category: "convention" -> matches both #1 and #3.
        // // Intersection -> "Use standard convention"

        return matchesName || matchesDescription;
      }

      return true;
    });
  }, [patterns, searchQuery, selectedCategory]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredPatterns,
  };
}
