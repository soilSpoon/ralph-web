"use client";

import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate, formatPatternCategory } from "@/lib/formatters";
import { usePatternFilter } from "@/lib/hooks/use-pattern-filter";
import { mockPatterns } from "@/lib/mock-data";
import type { PatternCategory } from "@/lib/types";

const categories: {
  label: string;
  value: PatternCategory | null;
  count: number;
}[] = [
  { label: "All", value: null, count: mockPatterns.length },
  { label: "🔧 Build", value: "convention", count: 5 },
  { label: "📁 Files", value: "gotcha", count: 4 },
  { label: "🧪 Test", value: "tip", count: 3 },
];

export default function PatternsPage() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredPatterns,
  } = usePatternFilter(mockPatterns);
  return (
    <div className="container-custom py-6 space-y-6">
      <div>
        <h1 className="heading-1">🧠 Codebase Patterns</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patterns..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">📂 Categories</h2>
            <span className="text-sm text-muted-foreground">
              {filteredPatterns.length} patterns found
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.label}
                variant={
                  selectedCategory === category.value ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Patterns */}
      <div className="space-y-3">
        <h2 className="heading-2">📋 All Patterns</h2>

        {filteredPatterns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No patterns found matching your criteria.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPatterns.map((pattern) => (
            <Card
              key={pattern.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {getCategoryIcon(pattern.category)}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{pattern.pattern}</p>
                      <Badge variant="secondary">
                        {formatPatternCategory(pattern.category)}
                      </Badge>
                    </div>
                    {pattern.sourceFile && (
                      <p className="text-sm text-muted-foreground">
                        Source:{" "}
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                          {pattern.sourceFile}
                        </code>
                      </p>
                    )}
                    <p className="text-caption text-muted-foreground">
                      Created: {formatDate(pattern.createdAt)}
                      {pattern.promotedAt &&
                        ` • Promoted: ${formatDate(pattern.promotedAt)}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function getCategoryIcon(category: PatternCategory): string {
  const iconMap: Record<PatternCategory, string> = {
    convention: "🔧",
    gotcha: "⚠️",
    tip: "💡",
  };
  return iconMap[category] || "📝";
}
