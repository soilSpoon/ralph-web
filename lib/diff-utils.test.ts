import { describe, expect, it } from "vitest";
import { splitUnifiedDiffByFile } from "./diff-utils";

const mockDiff = `diff --git a/app/layout.tsx b/app/layout.tsx
index 123456..789012 100644
--- a/app/layout.tsx
+++ b/app/layout.tsx
@@ -1,5 +1,6 @@
 import type { Metadata } from "next";
 import { Inter } from "next/font/google";
+import { ThemeProvider } from "@/components/theme-provider";
 import "./globals.css";
 
 const inter = Inter({ subsets: ["latin"] });
@@ -12,7 +13,9 @@ export default function RootLayout({
   return (
     <html lang="en">
       <body className={inter.className}>
-        {children}
+        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
+          {children}
+        </ThemeProvider>
       </body>
     </html>
   );
diff --git a/components/theme-provider.tsx b/components/theme-provider.tsx
new file mode 100644
index 000000..abcdef
--- /dev/null
+++ b/components/theme-provider.tsx
@@ -0,0 +1,9 @@
+"use client"
+
+import * as React from "react"
+import { ThemeProvider as NextThemesProvider } from "next-themes"
+import { type ThemeProviderProps } from "next-themes/dist/types"
+
+export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
+  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
+}`;

describe("splitUnifiedDiffByFile", () => {
  it("should split a diff with multiple files correctly", () => {
    const files = splitUnifiedDiffByFile(mockDiff);

    expect(files).toHaveLength(2);

    // First file check
    expect(files[0].oldPath).toBe("app/layout.tsx");
    expect(files[0].newPath).toBe("app/layout.tsx");
    expect(files[0].additions).toBe(4); // +import, +<ThemeProvider, +{children}, +</ThemeProvider>
    expect(files[0].deletions).toBe(1); // -{children}

    // Second file check
    expect(files[1].oldPath).toBe("/dev/null"); // depending on implementation behavior
    expect(files[1].newPath).toBe("components/theme-provider.tsx");
    expect(files[1].additions).toBe(9);
    expect(files[1].deletions).toBe(0);
  });

  it("should handle empty diff", () => {
    const files = splitUnifiedDiffByFile("");
    expect(files).toHaveLength(0);
  });

  it("should parse file paths even with slight variations", () => {
    const singleDiff = `diff --git a/simple.txt b/simple.txt
--- a/simple.txt
+++ b/simple.txt
@@ -1 +1 @@
-Hello
+World`;
    const files = splitUnifiedDiffByFile(singleDiff);
    expect(files).toHaveLength(1);
    expect(files[0].oldPath).toBe("simple.txt");
    expect(files[0].newPath).toBe("simple.txt");
  });
});
