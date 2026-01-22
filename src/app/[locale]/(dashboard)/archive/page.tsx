"use client";

import { FolderArchive, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArchivedTaskList } from "@/components/archive/archived-task-list";
import { Input } from "@/components/ui/input";
import { mockTasks } from "@/lib/mock-data";

export default function ArchivePage() {
  const t = useTranslations("Archive");
  const [searchQuery, setSearchQuery] = useState("");

  const archivedTasks = mockTasks.filter((task) => task.archived);

  const handleRestore = (id: string) => {
    console.log("Restoring task:", id);
    // In a real app, this would be a server action or API call
  };

  return (
    <div className="container-custom py-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="heading-1 flex items-center gap-2">
          <FolderArchive className="w-8 h-8" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          className="pl-10 h-10 rounded-sm focus-visible:ring-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4 pt-2">
        <ArchivedTaskList
          tasks={archivedTasks}
          searchQuery={searchQuery}
          onRestore={handleRestore}
        />
      </div>
    </div>
  );
}
